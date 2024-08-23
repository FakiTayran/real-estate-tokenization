import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Map, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";
import { config } from "./config/wagmiConfig";
import { PropertyContract } from "./smart-contracts/Property";

import { formatEther } from "viem";

type PropertyDetails = {
  titleNumber: string;
  propertyAddress: string;
  onSale: boolean;
  leaseable: boolean;
  onLease: boolean;
  sellPrice: bigint;
  leasePrice: bigint;
  agentCommission: bigint;
  agentAddress: string;
  owner: string;
  sterlinPrice: string;
  squareMeters: string;
};

const useQuery = () => {
  // const search = useLocation().search
  // useCallback(() => {
  //   return new URLSearchParams(search);
  // }, [search])
  return new URLSearchParams(useLocation().search);
};
function abbreviateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function App() {
  const query = useQuery();
  const { isConnected } = useAccount();
  const [transactionReceipt, SetTransactionReceipt] = useState<
    string | undefined
  >(undefined);
  const [success, SetSuccess] = useState<boolean>(false);
  const propertyId = query.get("propertyid") || "1";
  const estateAgentId =
    query.get("estateagentid") || "64ed85e7-0283-4c5d-bea1-24aee0fd7c2e";
  const {
    data: property,
    isError,
    isLoading,
  } = useReadContract({
    config,
    address: PropertyContract.address,
    abi: PropertyContract.abi,
    functionName: "getProperty",
    args: [propertyId],
  });

  const handleBuy = async () => {
    if (propertyId && estateAgentId && !!property) {
      const { request } = await simulateContract(config as any, {
        abi: PropertyContract.abi,
        address: PropertyContract.address,
        functionName: "buy",
        args: [estateAgentId, propertyId],
        value: (property as PropertyDetails).sellPrice,
      });
      const hash = await writeContract(config, request);
      const receipt = await waitForTransactionReceipt(config, {
        hash,
        confirmations: 2,
      });

      return receipt.transactionHash;
    }
  };
  return (
    <main className="grid place-items-center h-screen max-w-6xl mx-auto"
    >
      <section className="container mx-auto flex flex-col gap-8">
        <h1 className="text-transparent bg-gradient-to-br from-primary/20 to-primary bg-clip-text text-[5rem] text-center">Apartment Sale</h1>

        {!!property && (
          <Table>
            <TableCaption className="font-light text-xs"></TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Title Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>On Sale</TableHead>
                <TableHead>On Lease</TableHead>
                <TableHead>Sell Price (MATIC)</TableHead>
                <TableHead>Sell Price (Sterlin)</TableHead>
                <TableHead>Floor Area</TableHead>
                <TableHead className="text-right">Current Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  {(property as PropertyDetails).titleNumber.toString()}
                </TableCell>
                <TableCell>
                  {(property as PropertyDetails).propertyAddress.toString()}
                </TableCell>
                <TableCell>
                  {(property as PropertyDetails).onSale ? "Yes" : "No"}
                </TableCell>
                <TableCell>
                  {(property as PropertyDetails).onLease ? "Yes" : "No"}
                </TableCell>
                <TableCell>
                  {formatEther((property as PropertyDetails).sellPrice)}
                </TableCell>
                <TableCell>
                  {(property as PropertyDetails).sterlinPrice}
                </TableCell>
                <TableCell>
                  {`${(property as PropertyDetails).squareMeters
                    } Square meters`}
                </TableCell>

                <TableCell className="text-right">
                  {abbreviateAddress((property as PropertyDetails).owner)}
                </TableCell>
              </TableRow>
              <TableRow>
                {Array.from({ length: 8 }).map((_, idx) => {
                  return (
                    <TableCell key={idx}>
                      <Skeleton className="w-[100px] h-[20px] rounded-full" />
                    </TableCell>
                  )
                })}
              </TableRow>
            </TableBody>
          </Table>

        )}

        <div className="flex w-full items-center justify-between gap-4">

          <Button variant="outline" className="w-1/2">
            <Map className="size-4 mr-2 text-primary" />
            See on Maps
          </Button>

          {isConnected ? (
            <Button
              className="w-1/2"
              disabled={
                isLoading ||
                isError
              }
              onClick={handleBuy}>
              <ShoppingBag className="size-4 mr-2 text-primary-foreground" />
              Buy
            </Button>
          ) : (
            <Button className="p-4 border w-1/2" id="connectBtn">
              <w3m-connect-button label="Connect your wallet" loadingLabel="Loading.." size="mdl" />
            </Button>
          )}
        </div>
      </section>

    </main>
  )
}

export default App;
