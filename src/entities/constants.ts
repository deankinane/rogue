enum FragmentTypes {
  function = "function",
  event = "event",
  constructor = "constructor",
}

enum FunctionTypes {
  payable = "payable",
  nonpayable = "nonpayable",
  pure = "pure",
  view = "view"
}

enum ParamTypes {
  uint256 = "uint256",
  address = "address",
  string = "string",
  bytes32 = "bytes32"
}

const BLOCKNATIVE_APPID = "28a94756-d0c2-41d2-83f3-7a8faafa95b2";

export {FragmentTypes, FunctionTypes, ParamTypes, BLOCKNATIVE_APPID};
