import React, { useEffect, useState } from 'react';
import { Download, WifiOff, CheckCircle2, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" />
        PWA Installed
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowModal(true);
          }
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        {isIOS ? 'Install on iOS' : 'Install App'}
      </button>

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 id="pwa-install-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Install AetherLearn as a Standalone App
              </h3>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              AetherLearn is a compliant Progressive Web App with offline IndexedDB persistence and service worker caching.
            </p>
            <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <p><strong>Desktop Chrome / Edge:</strong> Click the install icon in the browser address bar or menu (&ldquo;Install AetherLearn&rdquo;).</p>
              <p><strong>iOS Safari:</strong> Tap the <strong>Share</strong> button in the toolbar and select <strong>Add to Home Screen</strong>.</p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineConnectivityBanner: React.FC<{ hasUnsyncedChanges: boolean }> = ({
  hasUnsyncedChanges,
}) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-medium text-white shadow-lg"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        Offline Mode Active — Local IndexedDB storage enabled
        {hasUnsyncedChanges ? ' · Pending changes queued for sync' : ''}
      </span>
    </div>
  );
};
