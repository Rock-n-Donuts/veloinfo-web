import { useEffect, useState, useRef } from 'react';

const buildThresholdArray = () => [0, 1.0];

const observersCache = new Map();

const getOptionsKey = ({ root = null, rootMargin, threshold = null }) =>
    `root_${root}_rootMargin_${rootMargin || null}_threshold_${threshold}`;

const createObserver = (Observer, options = {}) => {
    let subscribers = [];

    const addSubscriber = (element, callback) => {
        const currentSubscriber = subscribers.find((it) => it.element === element) || null;
        if (currentSubscriber !== null) {
            return subscribers
                .map((it) =>
                    it.element === element && it.callbacks.indexOf(callback) === -1
                        ? {
                              ...it,
                              callbacks: [...it.callbacks, callback],
                          }
                        : it,
                )
                .filter((it) => it.callbacks.length > 0);
        }
        return [
            ...subscribers,
            {
                element,
                callbacks: [callback],
            },
        ];
    };

    const removeSubscriber = (element, callback) =>
        subscribers
            .map((it) =>
                it.element === element
                    ? {
                          ...it,
                          callbacks: it.callbacks.filter((subCallback) => subCallback !== callback),
                      }
                    : it,
            )
            .filter((it) => it.callbacks.length > 0);

    const onUpdate = (entries) => {
        entries.forEach((entry) => {
            subscribers.forEach(({ element, callbacks }) => {
                if (element === entry.target) {
                    callbacks.forEach((callback) => {
                        callback(entry);
                    });
                }
            });
        });
    };

    const observer = new Observer(onUpdate, options);

    const unsubscribe = (element, callback = null) => {
        subscribers = removeSubscriber(element, callback);
        if (typeof observer.unobserve === 'undefined') {
            observer.disconnect();
            subscribers.forEach((subscriber) => {
                observer.observe(subscriber.element);
            });
            return;
        }
        const currentSubscriber = subscribers.find((it) => it.element === element) || null;
        if (currentSubscriber === null) {
            observer.unobserve(element);
        }
    };

    const subscribe = (element, callback) => {
        const currentSubscriber = subscribers.find((it) => it.element === element) || null;
        subscribers = addSubscriber(element, callback);
        if (currentSubscriber === null) {
            observer.observe(element);
        }
    };

    return {
        subscribe,
        unsubscribe,
        observer,
    };
};

export const getObserver = (Observer, options = {}) => {
    const observerKey = getOptionsKey(options);
    if (!observersCache.has(Observer)) {
        observersCache.set(Observer, {});
    }
    const observers = observersCache.get(Observer);
    if (typeof observers[observerKey] === 'undefined') {
        observers[observerKey] = createObserver(Observer, options);
        observersCache.set(Observer, observers);
    }
    return observers[observerKey];
};

export const useObserver = (Observer, opts = {}, initialEntry = {}) => {
    const { root = null, rootMargin = null, threshold = null, disabled = false, ref = null } = opts;
    const [entry, setEntry] = useState(initialEntry);
    const nodeRef = useRef(ref);
    const currentElement = useRef(ref);
    const elementChanged = nodeRef.current !== currentElement.current;
    useEffect(() => {
        const { current: nodeElement } = nodeRef;
        const callback = (newEntry) => setEntry(newEntry);
        let unsubscribe = null;
        if (nodeElement !== null) {
            const newOpts = {};
            if (root !== null) {
                newOpts.root = root;
            }
            if (rootMargin !== null) {
                newOpts.rootMargin = rootMargin;
            }
            if (threshold !== null) {
                newOpts.threshold = threshold;
            }
            const { subscribe, unsubscribe: localUnsubscribe } = getObserver(Observer, newOpts);
            unsubscribe = localUnsubscribe;
            subscribe(nodeElement, callback);
        }
        currentElement.current = nodeElement;
        return () => {
            if (unsubscribe !== null) {
                unsubscribe(nodeElement, callback);
            }
        };
    }, [Observer, elementChanged, disabled, root, rootMargin, threshold]);

    return {
        ref: nodeRef,
        entry,
    };
};

/**
 * Intersection Observer
 */
const thresholdArray = buildThresholdArray();
const intersectionObserverInitialEntry = {
    target: null,
    time: null,
    isVisible: false,
    isIntersecting: false,
    intersectionRatio: 0,
    intersectionRect: null,
    boundingClientRect: null,
    rootBounds: null,
};
export const useIntersectionObserver = ({
    root = null,
    rootMargin = '0px',
    threshold = thresholdArray,
    disabled = false,
    ref = null,
} = {}) =>
    useObserver(
        IntersectionObserver,
        {
            root,
            rootMargin,
            threshold,
            disabled,
            ref,
        },
        intersectionObserverInitialEntry,
    );

/**
 * Resize Observer
 */
const resizeObserverInitialEntry = {
    target: null,
    contentRect: null,
    contentBoxSize: null,
    borderBoxSize: null,
};
export const useResizeObserver = ({ disabled = false } = {}) =>
    useObserver(ResizeObserver, { disabled }, resizeObserverInitialEntry);
