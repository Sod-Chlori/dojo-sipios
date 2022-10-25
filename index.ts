import { serve } from "https://deno.land/std@0.119.0/http/server.ts";

async function handler(_req: Request): Promise<Response> {
  try {
    const wordToFind: string = "chien";
    const guess: any = await extractGuess(_req);
    const similarityResult: any = await similarity(guess, wordToFind);
    console.log(
      `Tried with word ${guess}, similarity is ${similarityResult}, word to find is ${wordToFind}`
    );
    return new Response(responseBuilder(guess, similarityResult));
  } catch (e) {
    console.error(e);
    return new Response("An error occured : ", e);
  }
}

const extractGuess = async (req: Request): Promise<any> => {
  const slackPayload: any = await req.formData();
  console.log("before the fall")
  console.log(slackPayload)
  console.log("after the fall")
  const guess: string = await slackPayload.get("text")?.toString();
  if (!guess) {
    throw new Error("Guess is empty or null");
  }
  return guess;
};

const responseBuilder = (word: string, similarity: Number): any => {
  if (similarity == 1) {
    return `Well played ! The word was ${word}.`;
  } else if (similarity > 0.5) {
    return `${word} is very close to the word, score : ${similarity}`;
  } else if (similarity < 0.5) {
    return `${word} is quite far to the word, score : ${similarity}`;
  }
};

const similarity = async (word1: any, word2: any): Promise<any> => {
  const body: any = {
    sim1: word1,
    sim2: word2,
    lang: "fr",
    type: "General Word2Vec",
  };
  console.log("body", body);
  const similarityResponse: any = await fetch(
    "http://nlp.polytechnique.fr/similarityscore",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  console.log("similarityResponse", similarityResponse);
  const similarityResponseJson: any = await similarityResponse.json();
  console.log("similarityValue", similarityResponseJson);
  return Number(similarityResponseJson.simscore);
};

serve(handler);