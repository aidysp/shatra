'use client'

import { useCallback, useEffect, useRef } from "react";

export const useSound = (soundPath: string) => {
    const soundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        soundRef.current = new Audio(soundPath);

        return () => {
            if (soundRef.current) {
                soundRef.current.pause();
                soundRef.current = null;
            }
        }
    }, [soundPath]);


    const play = useCallback(() => {
        if (soundRef.current) {
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(error => {
                console.warn("Error playing sound: ", error);
            })
        }
    }, []);


    return { play };
}
