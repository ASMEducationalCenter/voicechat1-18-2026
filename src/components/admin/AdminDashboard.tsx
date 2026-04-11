import React, { useState, useEffect } from 'react';
import {
  listAllowlistedUsers,
  addEmailToAllowlist,
  removeEmailFromAllowlist,
} from '../../services/allowlist';
import { db } from '../../services/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

const ADMIN_EMAIL = 'hamedm@asmed.com';
const TRIAL_DAYS = 90;
const WARNING_DAYS = 14;

type AllowlistUser = {
  email: string;
  addedAt?: string;
};

type FirestoreUser = {
  id: string;
  email?: string;
  createdAt?: any;
  lastLoginAt?: any;
  role?: string;
};

type DashboardStatus = 'Admin' | 'Active' | 'Expiring Soon' | 'Expired' | 'No account yet';

type DashboardUser = {
  id?: string;
  email: string;
  addedAt?: string;
  createdAt?: string;
  lastLoginAt?: string;
  role?: string;
  status: DashboardStatus;
  daysRemaining: number | null;
};

function formatDate(value?: string) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
}

function getDaysRemaining(createdAt?: string) {
  if (!createdAt) return null;

  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return null;

  const diffDays = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(TRIAL_DAYS - diffDays);
}

function getStatus(email: string, createdAt?: string, role?: string): DashboardStatus {
  if (email.toLowerCase() === ADMIN_EMAIL || role === 'admin') {
    return 'Admin';
  }

  const daysRemaining = getDaysRemaining(createdAt);

  if (daysRemaining === null) {
    return 'No account yet';
  }

  if (daysRemaining < 0) {
    return 'Expired';
  }

  if (daysRemaining <= WARNING_DAYS) {
    return 'Expiring Soon';
  }

  return 'Active';
}

function getStatusBadgeClass(status: DashboardStatus) {
  switch (status) {
    case 'Admin':
      return 'bg-purple-100 text-purple-700';
    case 'Active':
      return 'bg-green-100 text-green-700';
    case 'Expiring Soon':
      return 'bg-amber-100 text-amber-700';
    case 'Expired':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionEmail, setActionEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const allowlist = await listAllowlistedUsers();

      const usersSnapshot = db ? await getDocs(collection(db, 'users')) : null;
      const firestoreUsersByEmail = new Map<string, FirestoreUser>();

      if (usersSnapshot) {
        usersSnapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<FirestoreUser, 'id'>;
          const email = data.email?.trim().toLowerCase();
          if (!email) return;

          firestoreUsersByEmail.set(email, {
            id: docSnap.id,
            ...data,
          });
        });
      }

      const merged: DashboardUser[] = allowlist.map((entry: AllowlistUser) => {
        const email = entry.email.trim().toLowerCase();
        const firestoreUser = firestoreUsersByEmail.get(email);

        const createdAt =
          firestoreUser?.createdAt?.toDate?.()?.toISOString?.() || undefined;

        const lastLoginAt =
          firestoreUser?.lastLoginAt?.toDate?.()?.toISOString?.() || undefined;

        const role = firestoreUser?.role;
        const status = getStatus(email, createdAt, role);
        const daysRemaining =
          status === 'Admin' || status === 'No account yet' ? null : getDaysRemaining(createdAt);

        return {
          id: firestoreUser?.id,
          email: entry.email,
          addedAt: entry.addedAt,
          createdAt,
          lastLoginAt,
          role,
          status,
          daysRemaining,
        };
      });

      merged.sort((a, b) => {
        const priority = (status: DashboardStatus) => {
          switch (status) {
            case 'Expired':
              return 0;
            case 'Expiring Soon':
              return 1;
            case 'Active':
              return 2;
            case 'No account yet':
              return 3;
            case 'Admin':
              return 4;
            default:
              return 5;
          }
        };

        const p = priority(a.status) - priority(b.status);
        if (p !== 0) return p;

        if (a.daysRemaining === null && b.daysRemaining === null) {
          return a.email.localeCompare(b.email);
        }
        if (a.daysRemaining === null) return 1;
        if (b.daysRemaining === null) return -1;

        return a.daysRemaining - b.daysRemaining;
      });

      setUsers(merged);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await addEmailToAllowlist(newEmail.trim().toLowerCase());
      setNewEmail('');
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email}?`)) return;

    setActionEmail(email);
    setError(null);

    try {
      await removeEmailFromAllowlist(email);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to remove user');
    } finally {
      setActionEmail(null);
    }
  };

  const handleRenew90Days = async (user: DashboardUser) => {
    if (!db || !user.id) {
      setError('No user record exists yet to renew.');
      return;
    }

    if (!window.confirm(`Renew ${user.email} for 90 more days from today?`)) return;

    setActionEmail(user.email);
    setError(null);

    try {
      await updateDoc(doc(db, 'users', user.id), {
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to renew user');
    } finally {
      setActionEmail(null);
    }
  };

  const handleDeleteUserRecord = async (user: DashboardUser) => {
    if (!db || !user.id) {
      setError('No user record exists to delete.');
      return;
    }

    if (
      !window.confirm(
        `Delete the user record for ${user.email}? This should usually only be used for test accounts.`
      )
    ) {
      return;
    }

    setActionEmail(user.email);
    setError(null);

    try {
      await deleteDoc(doc(db, 'users', user.id));
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user record');
    } finally {
      setActionEmail(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
        <p className="text-slate-500 text-sm">
          Manage allowlisted users, account creation dates, and 90-day expiry status.
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleAdd} className="flex gap-3 mb-8">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter user email to allowlist"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Adding...' : 'Add User'}
          </button>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                <th className="px-4 py-3 border-b border-slate-100">Email</th>
                <th className="px-4 py-3 border-b border-slate-100">Allowlisted At</th>
                <th className="px-4 py-3 border-b border-slate-100">Account Created</th>
                <th className="px-4 py-3 border-b border-slate-100">Last Login</th>
                <th className="px-4 py-3 border-b border-slate-100">Days Remaining</th>
                <th className="px-4 py-3 border-b border-slate-100">Status</th>
                <th className="px-4 py-3 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                    No users allowlisted yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const busy = actionEmail === user.email;

                  return (
                    <tr
                      key={user.email}
                      className={`transition-colors ${
                        user.status === 'Expired'
                          ? 'bg-red-50 hover:bg-red-100'
                          : user.status === 'Expiring Soon'
                          ? 'bg-amber-50 hover:bg-amber-100'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-4 text-slate-900 font-medium">{user.email}</td>
                      <td className="px-4 py-4 text-slate-500 text-sm">{formatDate(user.addedAt)}</td>
                      <td className="px-4 py-4 text-slate-500 text-sm">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-4 text-slate-500 text-sm">{formatDate(user.lastLoginAt)}</td>
                      <td className="px-4 py-4 text-sm font-semibold">
                        {user.daysRemaining === null
                          ? 'N/A'
                          : user.daysRemaining < 0
                          ? 'Expired'
                          : user.daysRemaining}
                      </td>

                      {/* ✅ ONLY CHANGE HERE */}
                      <td className="px-4 py-4 text-sm">
                        <span className={`inline-flex items-center whitespace-nowrap px-3 py-1 rounded-full font-semibold ${getStatusBadgeClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-3 flex-wrap">
                          <button
                            onClick={() => handleRenew90Days(user)}
                            disabled={busy || !user.id || user.status === 'Admin'}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors disabled:opacity-40"
                          >
                            Renew 90 Days
                          </button>

                          <button
                            onClick={() => handleRemove(user.email)}
                            disabled={busy}
                            className="text-amber-600 hover:text-amber-800 font-semibold text-sm transition-colors disabled:opacity-40"
                          >
                            Remove Access
                          </button>

                          <button
                            onClick={() => handleDeleteUserRecord(user)}
                            disabled={busy || !user.id || user.status === 'Admin'}
                            className="text-red-500 hover:text-red-700 font-semibold text-sm transition-colors disabled:opacity-40"
                          >
                            Delete User Record
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
