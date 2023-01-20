import Image from "next/image";
import { AiFillHeart } from "react-icons/ai";
import { InfiniteData, QueryClient } from "@tanstack/react-query";

import Link from "next/link";
import { api, RouterInputs, RouterOutputs } from "../utils/api";
import dayjs from "dayjs";
import { LIMIT } from "./Timeline";

export default function Tweet({
  tweet,
  client,
  input,
}: {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
  input: RouterInputs["tweet"]["timeline"];
  client: QueryClient;
}) {
  const likeMutation = api.tweet.like.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, action: "like", input });
    },
  }).mutateAsync;
  const unlikeMutation = api.tweet.unlike.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, action: "unlike", input });
    },
  }).mutateAsync;

  const hasLiked = tweet.likes.length;
  return (
    <div className="mb-4 border-b-2 border-gray-500">
      <div className="flex p-2">
        {tweet.author.image && (
          <Image
            src={tweet.author.image}
            alt={`${tweet.author.name} profile image`}
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div className="ml-2">
          <div className="flex items-center">
            <p className="font-bold">
              <Link href={`/${tweet.author.name}`}>{tweet.author.name}</Link>
            </p>
            <p className="text-sm text-gray-400">
              {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>
          <div>{tweet.content}</div>
        </div>
      </div>
      <div className="mt-4 flex p-2">
        <AiFillHeart
          color={hasLiked ? "red" : "gray"}
          size="1.5rem"
          onClick={() => {
            if (!hasLiked) {
              likeMutation({ tweetId: tweet.id });
            } else {
              unlikeMutation({ tweetId: tweet.id });
            }
          }}
        />
        <span className="text-sm text-gray-500">{tweet._count.likes}</span>
      </div>
    </div>
  );
}

function updateCache({
  client,
  variables,
  data,
  action,
  input,
}: {
  client: QueryClient;
  variables: {
    tweetId: string;
  };
  data: {
    userId: string;
  };
  action: "like" | "unlike";
  input: RouterInputs["tweet"]["timeline"];
}) {
  client.setQueryData(
    [
      ["tweet", "timeline"],
      {
        input: {
          limit: LIMIT,
          where: {},
        },
        type: "infinite",
      },
    ],
    (oldData) => {
      const newData = oldData as InfiniteData<
        RouterOutputs["tweet"]["timeline"]
      >;
      const newTweets = newData.pages.map((page) => {
        return {
          tweets: page.tweets.map((tweet) => {
            if (tweet.id === variables.tweetId) {
              return {
                ...tweet,
                likes: action === "like" ? [data.userId] : [],
                _count:
                  action === "like"
                    ? { likes: tweet._count.likes + 1 }
                    : { likes: tweet._count.likes - 1 },
              };
            }
            return tweet;
          }),
        };
      });
      return {
        ...newData,
        pages: newTweets,
      };
    }
  );
}
