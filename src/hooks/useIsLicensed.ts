import { useEffect, useState } from "react";
import { checkIfLicenced } from "../entities/LicenceFunctions";

export interface LicenceInfo {
  checked: boolean,
  licensed: boolean;
}

export default function useIsLicensed(): LicenceInfo {
  const [licensed, setLicensed] = useState<LicenceInfo>({
    checked: false,
    licensed: false
  });

  useEffect(() => {
    const check = async () => {
      const result = await checkIfLicenced();
      setLicensed({
        checked: true,
        licensed: result
      });
    }

    check();
  }, []);

  return licensed;
}
