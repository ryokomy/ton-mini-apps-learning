import { useEffect, useState } from "react";
import Counter from "../contracts/counter";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonConnect } from "./useTonConnect";
import { Address, OpenedContract } from "@ton/core";

export function useCounterContract() {
  const client = useTonClient();
  const [val, setVal] = useState<null | string>();
  const { sender } = useTonConnect();

  const sleep = (time: number) =>
    new Promise((resolve) => setTimeout(resolve, time));

  const counterContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = new Counter(
      Address.parse("EQDwmzriBBecaGYRzAyqTGWiLLl6DwtsClpAa4uuMV0cdJDq") // replace with your address from tutorial 2 step 8
    );
    return client.open(contract) as OpenedContract<Counter>;
  }, [client]);

  useEffect(() => {
    let isCancelled = false;

    async function getValue() {
      if (!counterContract || isCancelled) return;
      setVal(null);
      const val = await counterContract.getCounter();
      if (!isCancelled) {
        setVal(val.toString());
        await sleep(5000); // sleep 5 seconds and poll value again
        getValue();
      }
    }

    getValue();

    return () => {
      isCancelled = true;
    };
  }, [counterContract]);

  return {
    value: val,
    address: counterContract?.address.toString(),
    sendIncrement: () => {
      return counterContract?.sendIncrement(sender);
    },
  };
}
