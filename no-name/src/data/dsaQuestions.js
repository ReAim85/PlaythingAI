// the three coding problems for the dsa round, in order easy -> medium -> hard.
// edit the text, examples, constraints or starter code freely, the interview
// just reads from this list. keep it to three items so karma's prompt matches.
export const dsaQuestions = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and a target, return the indices of the two numbers that add up to the target. You may assume exactly one valid answer exists and you cannot use the same element twice.",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]" },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]" },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "only one valid answer exists",
    ],
    starterCode: "function twoSum(nums, target) {\n  // your code here\n}\n",
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description:
      "Given a string s, find the length of the longest substring that has no repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3 (the answer is \"abc\")" },
      { input: 's = "bbbbb"', output: "1 (the answer is \"b\")" },
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s has english letters, digits, symbols and spaces",
    ],
    starterCode:
      "function lengthOfLongestSubstring(s) {\n  // your code here\n}\n",
  },
  {
    id: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    description:
      "Given an array height where each value is the height of a bar of width 1, return how much water can be trapped between the bars after it rains.",
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ],
    constraints: [
      "1 <= height.length <= 2 * 10^4",
      "0 <= height[i] <= 10^5",
    ],
    starterCode: "function trap(height) {\n  // your code here\n}\n",
  },
];

//for redeploy cause vercel didn't detected my last push

// the hidden message we send to karma right before the very first problem.
// it tells her to wrap up the chat and move into the coding round.
export const transitionNote =
  "[DIRECTOR NOTE - DO NOT READ ALOUD] Wrap up the current topic in one short sentence, then warmly move the candidate into a short coding round. Then present the problem below. [END NOTE]";

// builds the hidden message that gives karma one problem to present.
// we keep it short and ask her to use her own words so she does not read it out word for word.
export function formatProblemDirective(problem, index, total) {
  return (
    `[DIRECTOR NOTE - DO NOT READ ALOUD] Problem ${index + 1} of ${total} (${problem.difficulty}). ` +
    "Present this to the candidate in your own warm words, do not read it word for word:\n" +
    `Title: ${problem.title}\n` +
    `Task: ${problem.description}\n` +
    "Ask them to explain their approach, then let them code. [END NOTE]"
  );
}
