export function parseStatement(s) {
  const splitString = s.split(/\s+/);
  if (splitString.length !== 3)
    throw new Error(`Expected 3 parts. Invalid statement ${s}`);
  const [lhs, operator, rhs] = splitString;
  return { lhs, operator, rhs };
}
