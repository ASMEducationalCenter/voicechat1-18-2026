
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from '@google/genai';
import { InterviewStatus, TranscriptionItem } from './types';
import { INTERVIEW_QUESTIONS, SYSTEM_INSTRUCTION } from './constants';

// --- Utility Functions for Audio ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Components ---

const TranscriptionDisplay: React.FC<{ items: TranscriptionItem[] }> = ({ items }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items]);

  return (
    <div 
      ref={scrollRef}
      className="bg-white rounded-xl shadow-inner border border-slate-200 h-64 overflow-y-auto p-4 space-y-4"
    >
      {items.length === 0 && (
        <div className="flex items-center justify-center h-full text-slate-400 italic">
          Conversation transcription will appear here...
        </div>
      )}
      {items.map((item, idx) => (
        <div 
          key={idx} 
          className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
            {item.role === 'user' ? 'You' : 'Coach'}
          </span>
          <div 
            className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
              item.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
            }`}
          >
            {item.text}
          </div>
        </div>
      ))}
    </div>
  );
};

const Header: React.FC = () => (
  <header className="bg-white border-b border-slate-200 py-6 mb-8">
    <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">ASM Educational Center</h1>
          <p className="text-sm text-slate-500 font-medium">IT Help Desk Mock Interview Coach</p>
        </div>
      </div>
      <div className="hidden md:block text-right">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Tier 1 Specialist Training
        </span>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [status, setStatus] = useState<InterviewStatus>(InterviewStatus.IDLE);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextInRef.current) {
      audioContextInRef.current.close();
      audioContextInRef.current = null;
    }
    if (audioContextOutRef.current) {
      audioContextOutRef.current.close();
      audioContextOutRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setStatus(InterviewStatus.FINISHED);
  }, []);

  const startInterview = async () => {
    try {
      setStatus(InterviewStatus.CONNECTING);
      setErrorMsg(null);
      setTranscriptions([]);

      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key is missing");

      const ai = new GoogleGenAI({ apiKey });

      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextInRef.current = inCtx;
      audioContextOutRef.current = outCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus(InterviewStatus.ACTIVE);
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Playback
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const outCtx = audioContextOutRef.current;
              if (outCtx) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                const buffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
                const source = outCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outCtx.destination);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
              }
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Handle Transcriptions
            if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const userInput = currentInputTranscriptionRef.current;
              const coachOutput = currentOutputTranscriptionRef.current;
              
              const newItems: TranscriptionItem[] = [];
              if (userInput) newItems.push({ role: 'user', text: userInput, timestamp: Date.now() });
              if (coachOutput) newItems.push({ role: 'model', text: coachOutput, timestamp: Date.now() });
              
              if (newItems.length > 0) {
                setTranscriptions(prev => [...prev, ...newItems]);
              }

              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }
          },
          onerror: (e) => {
            console.error('Session Error:', e);
            setErrorMsg("Connection lost. Please try again.");
            stopSession();
          },
          onclose: () => {
            console.log('Session Closed');
            if (status !== InterviewStatus.FINISHED) {
                setStatus(InterviewStatus.FINISHED);
            }
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to start interview. Check microphone permissions.");
      setStatus(InterviewStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-12">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4">
        {status === InterviewStatus.IDLE && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready for your Interview?</h2>
              <p className="text-slate-600 max-w-xl mx-auto mb-8 text-lg leading-relaxed">
                Experience a realistic, voice-based mock interview for an IT Help Desk role. 
                We'll cover 30 essential questions with professional feedback for each one.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-10 text-left">
                {[
                  { icon: "✓", title: "30 Questions", desc: "Comprehensive Tier 1 coverage" },
                  { icon: "✓", title: "Voice Feedback", desc: "Real-time coaching notes" },
                  { icon: "✓", title: "Final Report", desc: "Score & 7-day practice plan" }
                ].map((feature, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-blue-600 font-bold block mb-1">{feature.icon} {feature.title}</span>
                    <span className="text-slate-500 text-sm">{feature.desc}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={startInterview}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center mx-auto text-lg"
              >
                Start Mock Interview
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {status === InterviewStatus.CONNECTING && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-xl border border-slate-200">
            <div className="relative">
              <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="mt-8 text-xl font-medium text-slate-900">Setting up your interview booth...</p>
            <p className="mt-2 text-slate-500">Checking microphone and connecting to ASM Coach</p>
          </div>
        )}

        {status === InterviewStatus.ACTIVE && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Interview Session Live</span>
                </div>
                <button
                  onClick={stopSession}
                  className="text-sm font-semibold text-slate-400 hover:text-red-600 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  End Session
                </button>
              </div>

              <div className="mb-10 text-center">
                <div className="inline-block p-4 rounded-full bg-blue-50 border-4 border-blue-100 mb-6">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">The Coach is listening...</h3>
                <p className="text-slate-500 text-lg">Speak naturally. Answer the questions as if you're in a real interview.</p>
              </div>

              <TranscriptionDisplay items={transcriptions} />
            </div>

            <div className="bg-blue-600 rounded-xl p-4 flex items-center justify-between text-white shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Use professional keywords like <b>SLA, First point of contact,</b> and <b>Document findings</b>.</p>
              </div>
            </div>
          </div>
        )}

        {status === InterviewStatus.FINISHED && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Interview Session Completed</h2>
            <p className="text-slate-600 text-lg mb-8">
              Great job finishing the mock interview. You can review the transcription below or start a new session.
            </p>
            
            <div className="text-left mb-10">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Final Session Log</h4>
              <TranscriptionDisplay items={transcriptions} />
            </div>

            <button
              onClick={() => setStatus(InterviewStatus.IDLE)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all"
            >
              Back to Start
            </button>
          </div>
        )}

        {status === InterviewStatus.ERROR && (
          <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-10 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-8">{errorMsg || "An unexpected error occurred."}</p>
            <button
              onClick={() => setStatus(InterviewStatus.IDLE)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} ASM Educational Center. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
