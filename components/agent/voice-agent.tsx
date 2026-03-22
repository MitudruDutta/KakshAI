'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useStageStore } from '@/lib/store/stage';
import { useSettingsStore } from '@/lib/store/settings';
import { clientTools } from '@/lib/elevenlabs/client-tools';
import { buildSceneContextSummary } from '@/lib/elevenlabs/scene-context';
import { cn } from '@/lib/utils';
import { Mic, MicOff, PhoneOff, Phone, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TranscriptEntry {
  role: 'agent' | 'user';
  text: string;
  timestamp: number;
}

export function VoiceAgent() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const elevenlabsApiKey = useSettingsStore((s) => s.elevenlabsApiKey);
  const elevenlabsAgentId = useSettingsStore((s) => s.elevenlabsAgentId);
  const currentSceneId = useStageStore((s) => s.currentSceneId);

  const conversation = useConversation({
    clientTools,
    micMuted,
    onMessage: (message) => {
      if (!message.message?.trim()) {
        return;
      }

      if (message.role === 'agent') {
        setTranscript((prev) => [
          ...prev,
          {
            role: 'agent',
            text: message.message,
            timestamp: Date.now(),
          },
        ]);
      } else if (message.role === 'user') {
        setTranscript((prev) => [
          ...prev,
          {
            role: 'user',
            text: message.message,
            timestamp: Date.now(),
          },
        ]);
      }
    },
    onError: (err) => {
      setError(typeof err === 'string' ? err : 'Connection error');
    },
    onConnect: () => {
      setError(null);
    },
  });

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Send contextual update when scene changes
  useEffect(() => {
    if (conversation.status !== 'connected' || !currentSceneId) return;

    const scene = useStageStore.getState().getCurrentScene();
    if (!scene) return;

    const scenes = useStageStore.getState().scenes;
    const idx = scenes.findIndex((s) => s.id === scene.id);
    const contextText = buildSceneContextSummary(scene, {
      index: idx + 1,
      total: scenes.length,
    });

    conversation.sendContextualUpdate(contextText);
  }, [currentSceneId, conversation.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const startSession = useCallback(async () => {
    setError(null);
    setTranscript([]);

    try {
      // Get signed URL from server (uses env vars or client-provided keys)
      const headers: Record<string, string> = {};
      if (elevenlabsApiKey) headers['x-api-key'] = elevenlabsApiKey;
      if (elevenlabsAgentId) headers['x-elevenlabs-agent-id'] = elevenlabsAgentId;

      const res = await fetch('/api/elevenlabs/signed-url', { headers });
      const data = await res.json();

      if (!data.success || !data.signedUrl) {
        setError(data.error || 'Failed to get signed URL');
        return;
      }

      // Get initial slide context
      const scene = useStageStore.getState().getCurrentScene();
      const scenes = useStageStore.getState().scenes;
      const sceneIndex = scene ? scenes.findIndex((current) => current.id === scene.id) : -1;
      const slideContext =
        scene && sceneIndex >= 0
          ? buildSceneContextSummary(scene, {
              index: sceneIndex + 1,
              total: scenes.length,
            })
          : 'The student is in the classroom.';
      const teacherPrompt =
        'You are an AI teacher in KakshAI, an interactive classroom platform. ' +
        'You are having a voice conversation with a student who is going through a course. ' +
        'Be engaging, encouraging, and educational. Ask questions to check understanding. ' +
        'Keep responses concise (2-3 sentences) since this is a voice conversation. ' +
        'Use the available tools when helpful: search the web for fresh context, move between slides, ' +
        `and draw on the whiteboard to explain ideas visually. ${slideContext}`;

      await conversation.startSession({
        signedUrl: data.signedUrl,
        overrides: {
          agent: {
            prompt: {
              prompt: teacherPrompt,
            },
            firstMessage:
              "Hello! I'm your AI teacher. I can see your slides, look up supporting information, and use the whiteboard to explain ideas. What would you like to work on?",
            language: 'en',
          },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    }
  }, [conversation, elevenlabsApiKey, elevenlabsAgentId]);

  const endSession = useCallback(async () => {
    await conversation.endSession();
    setMicMuted(false);
  }, [conversation]);

  const toggleMic = useCallback(() => {
    setMicMuted((prev) => !prev);
  }, []);

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';
  const isMicMuted = conversation.micMuted ?? micMuted;

  return (
    <div className="flex h-full flex-col">
      {/* Status bar */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected
                ? 'bg-green-500'
                : isConnecting
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-gray-400',
            )}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected
              ? conversation.isSpeaking
                ? 'Teacher is speaking...'
                : 'Listening...'
              : isConnecting
                ? 'Connecting...'
                : 'Voice Agent'}
          </span>
        </div>

        {isConnected && conversation.isSpeaking && (
          <Volume2 className="h-4 w-4 animate-pulse text-blue-500" />
        )}
      </div>

      {/* Transcript area */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {transcript.length === 0 && !isConnected && !isConnecting && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-sm text-muted-foreground">
              <Phone className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>Start a voice conversation</p>
              <p className="text-xs mt-1">with your AI teacher</p>
            </div>
          </div>
        )}

        {transcript.map((entry, i) => (
          <div
            key={i}
            className={cn(
              'rounded-lg px-3 py-2 text-sm max-w-[85%]',
              entry.role === 'agent'
                ? 'bg-muted mr-auto'
                : 'bg-primary text-primary-foreground ml-auto',
            )}
          >
            {entry.text}
          </div>
        ))}

        {error && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 border-t px-3 py-3">
        {!isConnected && !isConnecting ? (
          <Button onClick={startSession} size="sm" className="gap-2">
            <Phone className="h-4 w-4" />
            Start Voice Chat
          </Button>
        ) : (
          <>
            <Button
              variant={isMicMuted ? 'destructive' : 'outline'}
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={toggleMic}
              disabled={!isConnected}
            >
              {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={endSession}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PhoneOff className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
