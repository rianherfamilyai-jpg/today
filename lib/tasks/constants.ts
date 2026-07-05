// The one number that makes "Today" work: a small, deliberate cap on how many
// active tasks live in Today at once. 6 comes from the Ivy Lee method. It is a
// *soft* cap — going past it nudges the overflow to Someday, it never blocks.
export const TODAY_CAP = 6;
