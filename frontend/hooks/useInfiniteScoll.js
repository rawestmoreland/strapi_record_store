import { useState, useEffect, useRef } from 'react';

const useInfiniteScroll = (callback) => {
  const [isFetching, setIsFetching] = useState(false);
  const sentinel = useRef();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsFetching(true);
      }
    });

    if (sentinel.current) {
      observer.observe(sentinel.current);
    }

    return () => {
      if (sentinel.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(sentinel.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isFetching) {
      callback(() => setIsFetching(false));
    }
  }, [isFetching, callback]);

  return [isFetching, sentinel];
};

export default useInfiniteScroll;
