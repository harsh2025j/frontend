"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface JitsiPlayerProps {
  roomName: string;
  subject?: string;
  displayName: string;
  email?: string;
  isInstructor: boolean;
  password?: string;
  onMeetingEnd?: () => void;
  onApiReady?: (api: any) => void;
  className?: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function JitsiPlayer({
  roomName,
  subject,
  displayName,
  email,
  isInstructor,
  password,
  onMeetingEnd,
  onApiReady,
  className = "",
}: JitsiPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Normalize room name to ensure Sajjad Husain Legal Academy branding
  const normalizedRoomName = (roomName || "sh-academy-live-room")
    .replace(/^legalacademy-live-/, "sajjad-husain-legal-academy-live-")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-");

  const meetingSubject = subject || "Sajjad Husain Legal Academy Live Classroom";

  useEffect(() => {
    let isMounted = true;

    const loadJitsiScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const existingScript = document.getElementById("jitsi-external-api");
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve());
          existingScript.addEventListener("error", () => reject(new Error("Failed to load Jitsi API script")));
          return;
        }

        const jaasAppId = process.env.NEXT_PUBLIC_JAAS_APP_ID || "vpaas-magic-cookie-61afd8e844544b6ca25d2ecc93d19670";
        const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || (jaasAppId ? "8x8.vc" : "meet.jit.si");
        const script = document.createElement("script");
        script.id = "jitsi-external-api";
        script.src = jaasAppId
          ? `https://${jitsiDomain}/${jaasAppId}/external_api.js`
          : `https://${jitsiDomain}/external_api.js`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Jitsi API script. Check internet connection."));
        document.body.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        await loadJitsiScript();
        if (!isMounted || !containerRef.current) return;

        // Clean up previous instance if exists
        if (jitsiApiRef.current) {
          try {
            jitsiApiRef.current.dispose();
          } catch (e) {
            console.error("Error disposing previous Jitsi instance", e);
          }
          jitsiApiRef.current = null;
        }

        // Student toolbar: Includes essential media, chat, and native leave/hangup
        const studentToolbar = [
          "microphone",
          "camera",
          "chat",
          "raisehand",
          "tileview",
          "fullscreen",
          "hangup",
        ];

        // Instructor toolbar: Full host controls
        const instructorToolbar = [
          "microphone",
          "camera",
          "desktop",
          "chat",
          "raisehand",
          "participants-pane",
          "tileview",
          "fullscreen",
          "security",
          "mute-everyone",
          "hangup",
        ];

        const jaasAppId = process.env.NEXT_PUBLIC_JAAS_APP_ID || "vpaas-magic-cookie-61afd8e844544b6ca25d2ecc93d19670";
        const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || (jaasAppId ? "8x8.vc" : "meet.jit.si");
        const jaasRoomName = jaasAppId ? `${jaasAppId}/${normalizedRoomName}` : normalizedRoomName;

        // Fetch official signed 8x8 JaaS JWT token using your private key
        let jaasJwtToken: string | undefined = undefined;
        try {
          const tokenRes = await fetch("/api/academy/live-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomName: jaasRoomName,
              isInstructor,
              displayName: displayName || (isInstructor ? "Instructor (Host)" : "Student"),
              email: email || "",
            }),
          });
          const tokenData = await tokenRes.json().catch(() => ({}));
          if (tokenData?.token) {
            jaasJwtToken = tokenData.token;
          }
        } catch (e) {
          console.warn("Could not fetch 8x8 JaaS token, proceeding with AppID join:", e);
        }

        const options: any = {
          roomName: jaasRoomName,
          ...(jaasJwtToken ? { jwt: jaasJwtToken } : {}),
          width: "100%",
          height: "100%",
          parentNode: containerRef.current,
          lang: "en",
          userInfo: {
            displayName: displayName || (isInstructor ? "Instructor" : "Student"),
            email: email || "",
          },
          configOverwrite: {
            subject: meetingSubject,
            defaultLanguage: "en",
            startWithAudioMuted: !isInstructor,
            startWithVideoMuted: !isInstructor,
            prejoinPageEnabled: false,
            prejoinConfig: {
              enabled: false,
            },
            disableDeepLinking: true,
            enableClosePage: false,
            enableWelcomePage: false,
            enableLobbyChat: false,
            enableInsecureRoomNameWarning: false,
            // Restrict remote actions for students
            remoteVideoMenu: {
              disableKick: !isInstructor, // Students CANNOT kick anyone!
              disableGrantModerator: !isInstructor, // Students CANNOT give/take moderator!
            },
            disableRemoteMute: !isInstructor, // Students CANNOT mute others!
            toolbarButtons: isInstructor ? instructorToolbar : studentToolbar,
            // Reconnection & network resilience
            p2p: { enabled: false }, // Use Jitsi video bridge for reliable routing
          },
          interfaceConfigOverwrite: {
            LANG_DETECTION: false,
            TOOLBAR_BUTTONS: isInstructor ? instructorToolbar : studentToolbar,
            SETTINGS_SECTIONS: ["devices", "language"],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: "",
            SHOW_POWERED_BY: false,
            DEFAULT_REMOTE_DISPLAY_NAME: "Student",
            HIDE_INVITE_MORE_HEADER: true,
          },
        };

        const api = new window.JitsiMeetExternalAPI(jitsiDomain, options);
        jitsiApiRef.current = api;
        if (onApiReady) onApiReady(api);

        // Immediately set subject and display name
        try {
          api.executeCommand("subject", meetingSubject);
          api.executeCommand("displayName", displayName || (isInstructor ? "Instructor" : "Student"));
        } catch (e) {}

        // Auto-dismiss loading overlay after 2.5 seconds so Jitsi UI, prejoin, or permission prompts are never obscured
        const autoDismissTimer = setTimeout(() => {
          if (isMounted) setIsLoading(false);
        }, 2500);

        try {
          const iframe = api.getIFrame?.();
          if (iframe) {
            iframe.addEventListener("load", () => {
              if (isMounted) setIsLoading(false);
              try {
                api.executeCommand("subject", meetingSubject);
                api.executeCommand("displayName", displayName || (isInstructor ? "Instructor" : "Student"));
              } catch (e) {}
            });
          }
        } catch (e) {
          // getIFrame fallback
        }

        api.addEventListener("videoConferenceJoined", () => {
          if (!isMounted) return;
          clearTimeout(autoDismissTimer);
          setIsLoading(false);

          try {
            api.executeCommand("subject", meetingSubject);
            api.executeCommand("displayName", displayName || (isInstructor ? "Instructor" : "Student"));
          } catch (e) {}

          // If instructor, set room security password automatically
          if (isInstructor && password) {
            try {
              api.executeCommand("password", password);
            } catch (e) {
              console.warn("Could not set room password", e);
            }
          }
        });

        // Track participants to handle internet glitches and safeguard instructor moderation
        const knownParticipants = new Map<string, string>(); // id -> displayName

        api.addEventListener("participantJoined", (participant: any) => {
          if (!isMounted) return;
          const pId = participant.id;
          const pName = participant.displayName || "";
          knownParticipants.set(pId, pName);

          // If this student client held temporary moderator due to an instructor reconnect/glitch,
          // instantly handover moderator back to the instructor as soon as they re-enter!
          if (!isInstructor && (pName.includes("(Host)") || pName.toLowerCase().includes("instructor"))) {
            try {
              api.executeCommand("grantModerator", pId);
            } catch (e) {}
          }
        });

        api.addEventListener("participantLeft", (participant: any) => {
          if (!isMounted) return;
          knownParticipants.delete(participant.id);
        });

        api.addEventListener("participantRoleChanged", (event: any) => {
          if (!isMounted) return;
          // If this student client ever gets assigned moderator role by Jitsi fallback:
          if (!isInstructor && event.role === "moderator") {
            // Find the instructor in the room and yield moderator back immediately
            for (const [id, name] of knownParticipants.entries()) {
              if (name.includes("(Host)") || name.toLowerCase().includes("instructor")) {
                try {
                  api.executeCommand("grantModerator", id);
                  break;
                } catch (e) {}
              }
            }
          }
        });

        let hasTriggeredEnd = false;
        const handleMeetingEndEvent = () => {
          if (hasTriggeredEnd) return;
          hasTriggeredEnd = true;
          if (onMeetingEnd) onMeetingEnd();
        };

        api.addEventListener("videoConferenceLeft", handleMeetingEndEvent);
        api.addEventListener("readyToClose", handleMeetingEndEvent);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Jitsi init error:", err);
        setError(err.message || "Unable to connect to live classroom.");
        setIsLoading(false);
      }
    };

    initializeJitsi();

    return () => {
      isMounted = false;
      if (onApiReady) onApiReady(null);
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {
          console.error("Error disposing Jitsi instance", e);
        }
        jitsiApiRef.current = null;
      }
    };
  }, [normalizedRoomName, meetingSubject, displayName, isInstructor, password]);

  const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.jit.si";

  return (
    <div className={`relative w-full h-full min-h-[520px] bg-[#0a1628] rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a1628]/95 backdrop-blur-sm text-white">
          <Loader2 size={44} className="animate-spin text-[#C9A227] mb-4" />
          <p className="text-base font-bold tracking-wide">Connecting to Secure Live Classroom...</p>
          <p className="text-xs text-white/50 mt-1">Initializing audio and video streams</p>
          <button
            type="button"
            onClick={() => setIsLoading(false)}
            className="mt-4 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/90 border border-white/10 transition cursor-pointer"
          >
            Click to Reveal Video Screen
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a1628] text-white p-6 text-center">
          <AlertCircle size={48} className="text-red-500 mb-3" />
          <h3 className="text-lg font-bold">Failed to Connect</h3>
          <p className="text-sm text-white/70 max-w-md mt-1">{error}</p>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-[#C9A227] text-[#0a1628] rounded-xl font-bold text-sm hover:bg-[#b08d20] transition"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Embedded Iframe Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[520px] flex-1 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0" 
      />
    </div>
  );
}
