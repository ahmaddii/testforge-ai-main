import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/store';
import { Loader2 } from 'lucide-react';

interface VideoCallProps {
  roomName: string;
  onLeave?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const VideoCall: React.FC<VideoCallProps> = ({ roomName, onLeave }) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const user = useApp((s) => s.user);

  useEffect(() => {
    const appId = 'vpaas-magic-cookie-8a5a91c98b204d2a8dc6b500d32ef24a';
    
    const loadJitsiScript = () => {
      return new Promise<void>((resolve) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = `https://8x8.vc/${appId}/external_api.js`;
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    let api: any = null;

    loadJitsiScript().then(() => {
      if (jitsiContainerRef.current) {
        setLoading(false);
        const options = {
          roomName: `${appId}/${roomName}`,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: user?.name || user?.email || 'User',
            email: user?.email,
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableWelcomePage: false,
            hideConferenceTimer: false,
            hideConferenceSubject: true,
            disableThirdPartyRequests: true,
          },
          interfaceConfigOverwrite: {
            TILE_VIEW_MAX_COLUMNS: 3,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            DEFAULT_LOGO_URL: '',
            DEFAULT_WELCOME_PAGE_LINK: '',
            HIDE_INVITE_ON_WELCOME_PAGE: true,
            MOBILE_APP_PROMO: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
            RECENT_LIST_ENABLED: false,
            VIDEO_QUALITY_LABEL_DISABLED: true,
          },
        };
        api = new window.JitsiMeetExternalAPI('8x8.vc', options);
        api.on('readyToClose', () => {
          if (onLeave) onLeave();
        });
      }
    });

    return () => {
      if (api) {
        api.dispose();
      }
    };
  }, [roomName, user]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white z-50">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-slate-400 animate-pulse">Initializing Video Engine...</p>
        </div>
      )}
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
};
