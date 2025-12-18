tolk 1.0

struct Storage {
  addr_a: address
  addr_b: address
  nonce: uint64
  closed: uint1
}

// Close message definition (top-level for Tolk 1.2)
struct (0x00C10E5E) Close {
  queryId: uint64
  finalNonce: uint64
  amountA: coins
  amountB: coins
}

type AllowedMessage = Close

fun Storage.load() {
  return Storage.fromCell(contract.getData())
}

fun Storage.save(self) {
  contract.setData(self.toCell());
}

fun onInternalMessage(in: InMessage) {
  // Accept incoming funds by default.
  // Handle close message with final nonce and amounts

  if (!in.body.isEmpty()) {
    val msg = lazy AllowedMessage.fromSlice(in.body);
    match (msg) {
      Close => {
        var s = lazy Storage.load();
        assert (s.closed == 0) throw 1001; // already closed
        assert (msg.finalNonce >= s.nonce) throw 1002; // stale nonce
        // payouts: create and send messages with PAY_GAS_SEPARATELY (64)
        if (msg.amountA > 0) {
          val mA = createMessage({ bounce: BounceMode.NoBounce, value: msg.amountA, dest: s.addr_a, body: in.body });
          mA.send(64);
        }
        if (msg.amountB > 0) {
          val mB = createMessage({ bounce: BounceMode.NoBounce, value: msg.amountB, dest: s.addr_b, body: in.body });
          mB.send(64);
        }
        s.nonce = msg.finalNonce;
        s.closed = 1;
        s.save();
      }
      else => {
        assert (false) throw 0xFFFF
      }
    }
  }
}

get fun get_nonce(): int {
  val s = lazy Storage.load();
  return s.nonce;
}

get fun get_closed(): int {
  val s = lazy Storage.load();
  return s.closed;
}
