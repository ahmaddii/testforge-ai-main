import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Send, MessageSquare, RotateCw, Mic, Trash2, Pause, Square, Play, Video } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { uploadToStorage } from "@/lib/storage";
import { PaywallOverlay } from "@/components/paywall-overlay";
import { MessagesSquare } from "lucide-react";

export const Route = createFileRoute("/app/chat")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "Team Chat — Speclane" }] }),
});

type Message = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: { full_name?: string; avatar_url?: string; email?: string };
};

const VoiceMessage = ({ src, isMe }: { src: string, isMe: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(new Array(35).fill(15));
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Chrome bug workaround for base64 webm duration
    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current && audioRef.current.duration !== Infinity) {
          setDuration(audioRef.current.duration);
        }
      });
    }

    // Extract REAL audio waveform data directly from the audio file
    const extractWaveform = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const res = await fetch(src);
        const arrayBuffer = await res.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const channelData = audioBuffer.getChannelData(0); // Use left channel
        const samples = 35; // We want 35 bars
        const blockSize = Math.floor(channelData.length / samples);
        const extracted = [];

        for (let i = 0; i < samples; i++) {
          let start = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[start + j]);
          }
          extracted.push(sum / blockSize);
        }

        // Normalize heights
        const max = Math.max(...extracted) || 1;
        const normalized = extracted.map(n => Math.max(15, (n / max) * 100));
        setWaveform(normalized);
      } catch (err) {
        console.error("Failed to extract real waveform", err);
      }
    };

    extractWaveform();
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    let total = audioRef.current.duration;

    // Fallback if Infinity
    if (total === Infinity || isNaN(total)) total = Math.max(current, 1);

    setProgress((current / total) * 100);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs === Infinity) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`flex items-center gap-3 w-[220px] ${isMe ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
      <button
        onClick={togglePlay}
        className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center transition-colors ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-primary/10 hover:bg-primary/20 text-primary'
          }`}
      >
        {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 ml-1" fill="currentColor" />}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div
          className="flex items-center gap-[2px] w-full h-8 cursor-pointer group"
          onClick={(e) => {
            if (audioRef.current && audioRef.current.duration !== Infinity) {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              audioRef.current.currentTime = pos * audioRef.current.duration;
            }
          }}
        >
          {waveform.map((height, i) => {
            const isActive = (i / 35) * 100 <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-colors duration-100 ${isActive
                    ? (isMe ? 'bg-white' : 'bg-primary')
                    : (isMe ? 'bg-white/30' : 'bg-slate-200 dark:bg-white/20')
                  }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
        <div className={`text-[10px] font-mono tracking-tighter ${isMe ? 'text-white/70' : 'text-slate-500 dark:text-white/40'}`}>
          {audioRef.current ? formatTime(isPlaying ? audioRef.current.currentTime : (duration || 0)) : "0:00"}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onEnded={() => { setIsPlaying(false); setProgress(0); if (audioRef.current) audioRef.current.currentTime = 0; }}
      />
    </div>
  );
};

function ChatPage() {
  const user = useApp((s) => s.user);
  const onlineUsers = useApp((s) => s.onlineUsers);
  const billing = useApp((s) => s.billing);
  
  const canUseChat = billing?.plan === 'pro' || billing?.plan === 'business';
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioDraft, setAudioDraft] = useState<string | null>(null);
  const [audioBlobDraft, setAudioBlobDraft] = useState<Blob | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const shouldSendRef = useRef<boolean>(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const stopAudioContext = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => { });
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Pause/Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      stopAudioContext();
    } else {
      // Start recording
      try {
        setAudioDraft(null);
        shouldSendRef.current = false;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Setup Audio Analyzer for Real-time Waveform
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128; // 64 bins
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        const updateWaveform = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
          barsRef.current.forEach((bar, i) => {
            if (!bar) return;
            // Map 45 bars to lower/mid frequencies of the voice
            const binIndex = Math.floor((i / 45) * 25);
            const value = dataArrayRef.current![binIndex] || 0;
            // Value is 0-255. Make it a percentage, with a 15% min height
            const height = Math.max(15, (value / 255) * 100);
            bar.style.height = `${height}%`;
          });
          animationFrameRef.current = requestAnimationFrame(updateWaveform);
        };
        updateWaveform();

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          if (shouldSendRef.current) {
            try {
              const publicUrl = await uploadToStorage(audioBlob);
              await api.post('/messages', { content: `[VOICE_NOTE]:${publicUrl}` });
              fetchMessages();
            } catch (err: any) {
              console.error("Storage upload error:", err);
              toast.error("Failed to upload/send voice note");
            }
            setAudioDraft(null);
          } else {
            // For the draft preview, we use a local object URL
            const localUrl = URL.createObjectURL(audioBlob);
            setAudioDraft(localUrl);
            setAudioBlobDraft(audioBlob);
          }
          stream.getTracks().forEach(track => track.stop()); // release mic
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
      } catch (err) {
        toast.error("Microphone access denied. Please allow microphone permissions.");
      }
    }
  };

  const discardRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      stopAudioContext();
    }
    setAudioDraft(null);
    setAudioBlobDraft(null);
    setRecordingTime(0);
  };

  const sendVoiceDraft = async () => {
    if (isRecording) {
      shouldSendRef.current = true;
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      stopAudioContext();
    } else if (audioBlobDraft) {
      // Send existing draft
      try {
        const publicUrl = await uploadToStorage(audioBlobDraft);
        await api.post('/messages', { content: `[VOICE_NOTE]:${publicUrl}` });
        fetchMessages();
        setTimeout(() => {
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 100);
      } catch (err: any) {
        toast.error("Failed to upload/send voice note");
      }
      setAudioDraft(null);
      setAudioBlobDraft(null);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      setMessages(res || []);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Polling fallback: check every 5 seconds just in case Realtime fails
    const pollInterval = setInterval(fetchMessages, 5000);

    // Listen to real-time changes
    const channel = supabase.channel('chat-room')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        // Small delay to ensure the backend has finished its work
        setTimeout(fetchMessages, 200);
      })
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Smart auto-scroll: only scroll if the user is already near the bottom
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

      if (isNearBottom) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages.length]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !audioDraft) return;

    let content = newMessage.trim();
    if (audioDraft) {
      content = `[VOICE_NOTE]:${audioDraft}`;
    }

    setNewMessage(""); // optimistic clear
    setAudioDraft(null);

    try {
      await api.post('/messages', { content });
      fetchMessages();
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    }
  };

  const getSenderName = (msg: Message) => {
    if (msg.user_id === user?.id) return "You";
    return msg.profiles?.full_name || msg.profiles?.email || "Team Member";
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto p-4 sm:p-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          Team Chat
        </h1>
        <p className="text-slate-500 dark:text-white/50 text-sm">Collaborate with your QA team in real-time.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] shadow-none rounded-3xl">
        <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] py-4">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 dark:text-white/80">
              <span>Workspace Channel</span>
              <div className="flex items-center gap-1 ml-1">
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchMessages();
                  }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-primary"
                  title="Refresh Chat"
                >
                  <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
                </button>
                <Link
                  to="/app/video-call"
                  className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-primary"
                  title="Start Video Call"
                >
                  <Video className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-normal text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {onlineUsers.length} Online
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
          {loading ? (
            <div className="flex justify-center items-center h-full text-slate-400">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
              <MessageSquare className="h-12 w-12 opacity-20" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((msg) => {
                const isMe = msg.user_id === user?.id;
                return (
                  <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`flex max-w-[80%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-white/5 flex items-center justify-center mt-1">
                        {msg.profiles?.avatar_url ? (
                          <img src={msg.profiles.avatar_url} alt="User" className="h-full w-full object-cover" />
                        ) : (
                          <div className={`h-full w-full grid place-items-center text-[10px] font-bold ${isMe ? 'gradient-bg text-white' : 'bg-slate-200 dark:bg-white/10'}`}>
                            {(msg.profiles?.full_name?.[0] || msg.profiles?.email?.[0] || "U").toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Bubble Content */}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-white/40">
                            {isMe ? "You" : (msg.profiles?.full_name || msg.profiles?.email?.split('@')[0])}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-white/20 uppercase tracking-tighter font-mono">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm relative ${isMe
                              ? 'bg-primary text-primary-foreground rounded-tr-none shadow-blue-500/10'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-white/5'
                            } ${msg.content.startsWith('[VOICE_NOTE]:') ? 'p-2' : ''}`}
                        >
                          {msg.content.startsWith('[VOICE_NOTE]:') ? (
                            <VoiceMessage src={msg.content.replace('[VOICE_NOTE]:', '')} isMe={isMe} />
                          ) : (
                            msg.content
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 relative">

          {isRecording || audioDraft ? (
            <div className="flex flex-col gap-5 w-full bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-none animate-in slide-in-from-bottom-4 duration-300">
              {/* Top Row: Timer and Wave */}
              <div className="flex items-center gap-4 px-2">
                <span className="text-2xl font-mono text-slate-900 dark:text-white tracking-widest w-[60px]">{formatTime(recordingTime)}</span>

                <div className="flex-1 flex items-center justify-center gap-[3px] h-10 px-2 overflow-hidden">
                  {audioDraft ? (
                    <audio controls src={audioDraft} className="w-full h-10 dark:invert dark:sepia dark:hue-rotate-180 dark:brightness-90 dark:contrast-125" />
                  ) : (
                    Array.from({ length: 45 }).map((_, i) => (
                      <div
                        key={i}
                        ref={(el) => { barsRef.current[i] = el; }}
                        className="w-1 bg-primary/60 dark:bg-primary rounded-full transition-all duration-75 ease-out"
                        style={{ height: '15%' }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Row: Controls */}
              <div className="flex items-center justify-between px-2 relative">
                <button type="button" onClick={discardRecording} className="p-3 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                  <Trash2 className="h-6 w-6" />
                </button>

                {isRecording && (
                  <button type="button" onClick={toggleRecording} className="absolute left-1/2 -translate-x-1/2 p-3 text-red-500 rounded-full transition-colors hover:bg-red-50/50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 shadow-sm">
                    <Pause className="h-8 w-8" fill="currentColor" />
                  </button>
                )}

                <button type="button" onClick={sendVoiceDraft} className="p-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-colors shadow-none flex items-center justify-center">
                  <Send className="h-6 w-6 ml-1" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <div className="relative flex-1 flex items-center bg-white dark:bg-[#14120B] border-slate-200 dark:border-white/10 rounded-full h-12 border focus-within:ring-1 focus-within:ring-primary/30 shadow-sm transition-all">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                  className="flex-1 border-0 focus-visible:ring-0 bg-transparent h-full px-5 rounded-full shadow-none"
                />
                <button
                  type="button"
                  onClick={toggleRecording}
                  className="mr-3 p-2 text-slate-400 hover:text-primary transition-all shrink-0 z-10"
                  title="Record Voice Note"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>

              {newMessage.trim() ? (
                <button type="submit" className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-none shrink-0 flex items-center justify-center transition-all hover:scale-105">
                  <Send className="h-5 w-5 ml-0.5" />
                </button>
              ) : null}
            </form>
          )}
        </div>
      </Card>
      {!canUseChat && (
        <PaywallOverlay 
          title="Team Collaboration"
          description="Unlock real-time messaging, voice notes, and collaborative QA rooms for your whole team."
          planRequired="Pro"
          icon={<MessagesSquare className="h-10 w-10 text-primary" />}
        />
      )}
    </div>
  );
}
