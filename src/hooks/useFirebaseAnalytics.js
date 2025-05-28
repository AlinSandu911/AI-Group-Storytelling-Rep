'use cliente';

import { useEffect, useState } from 'react';
import { analytics } from '@/firebase/firebaseConfig';
import { logEvent} from 'firebase/analytics';

export function useFirebaseAnalytics() {
    const [isAnalyticsReady, setIsAnalyticsReady] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && analytics) {
            setIsAnalyticsReady(true);
        }
    }, []);

    const logAnalyticsEvent = (eventName, eventParams = {}) => {
        if (isAnalyticsReady && analytics) {
            logEvent(analytics, eventName, eventParams);
        }
    };

    return { logAnalyticsEvent, isAnalyticsReady};
}