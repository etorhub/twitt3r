import dayjs from "dayjs";
import { api, RouterInputs, RouterOutputs } from "../utils/api";
import { CreateTweet } from "./CreateTweet";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Tweet from "./Tweet";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1g",
    hh: "%dh",
    d: "1d",
    dd: "%dh",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

export const LIMIT = 10;
function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const handleScroll = () => {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const windScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const scrolled = (windScroll / height) * 100;
    setScrollPosition(scrolled);
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return scrollPosition;
}

export function Timeline({
  where = {},
}: {
  where: RouterInputs["tweet"]["timeline"]["where"];
}) {
  const client = useQueryClient();
  const scrollPosition = useScrollPosition();
  const { data, hasNextPage, fetchNextPage, isFetching } =
    api.tweet.timeline.useInfiniteQuery(
      {
        where,
        limit: LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  return (
    <div className="">
      <CreateTweet />
      <div className="border-l-2 border-r-2 border-t-2 border-gray-500">
        {tweets.map((tweet) => (
          <Tweet
            key={tweet.id}
            tweet={tweet}
            client={client}
            input={{
              where,
              limit: LIMIT,
            }}
          />
        ))}
        {!hasNextPage && <p>no more items to load</p>}
      </div>
    </div>
  );
}
