import { useState } from "react";
import { z } from "zod";
import { api } from "../utils/api";

export const tweetSchema = z.object({
  text: z
    .string({
      required_error: "Tweet content is required",
    })
    .min(1)
    .max(280),
});

export function CreateTweet() {
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const utils = api.useContext();
  const { mutateAsync } = api.tweet.create.useMutation({
    onSuccess: () => {
      setText("");
      utils.tweet.timeline.invalidate();
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await tweetSchema.parse({ text });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.message);
        return;
      }
    }
    mutateAsync({ text });
  }

  return (
    <>
      {error ?? <div>{error}</div>}
      <form
        className="mb-4 flex flex-col rounded-md border-2 p-4"
        onSubmit={handleSubmit}
      >
        <textarea
          className="w-full p-4 shadow"
          onChange={(e) => setText(e.target.value)}
        />
        <div>
          <button
            className="rounded-md bg-primary px-4 py-2 text-white"
            type="submit"
          >
            Tweet
          </button>
        </div>
      </form>
    </>
  );
}
