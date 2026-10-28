import { useEffect, useRef } from 'react';

/**
 * Debounce writing a locally edited value to the store. Unlike useUserEventDebounce, a pending write is
 * flushed (not dropped) on unmount or when flushKey changes, so leaving a tab or switching nodes mid-debounce keeps the edit.
 * @param commit called with the value - capture any target (i.e. node id) from the render the value changed in
 * @param flushKey identity of what is being edited, i.e. diagramNodeId
 */
const useDebouncedCommit = <T,>(value: T, commit: (value: T) => void, flushKey: unknown, delay: number = 300, enabled: boolean = true) => {
    const pendingCommitRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        const writeValue = () => {
            pendingCommitRef.current = null;
            commit(value);
        };
        pendingCommitRef.current = writeValue;
        const commitDelay = setTimeout(writeValue, delay);
        return () => clearTimeout(commitDelay);
    }, [value]);

    useEffect(() => {
        return () => pendingCommitRef.current?.();
    }, [flushKey]);
}

export default useDebouncedCommit;
