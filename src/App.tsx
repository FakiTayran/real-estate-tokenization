import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useAccount, useReadContract } from "wagmi";
import { PropertyContract } from "./smart-contracts/Property";
import { config } from "./config/wagmiConfig";
import { useLocation } from "react-router-dom";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";
import { useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { formatEther } from "viem";

type PropertyDetails = {
  titleNumber: string;
  propertyAddress: string;
  onSale: boolean;
  leaseable: boolean;
  onLease: boolean;
  sellPrice: bigint;
  leasePrice: bigint;
  leaseStartTime: number;
  leaseEndTime: number;
  leaseDeadline: number;
  agentCommission: bigint;
  agentAddress: string;
  owner: string;
};
const useQuery = () => {
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
  const propertyId = query.get("propertyId") || "1";
  const agentId = query.get("agentId") || "1";
  const tokenId = 1;
  const {
    data: property,
    isError,
    isLoading,
  } = useReadContract({
    config,
    address: PropertyContract.address,
    abi: PropertyContract.abi,
    functionName: "getApartment",
    args: [tokenId],
  });

  const handleBuy = async () => {
    if (propertyId && agentId && !!property) {
      const { request } = await simulateContract(config as any, {
        abi: PropertyContract.abi,
        address: PropertyContract.address,
        functionName: "buy",
        args: [propertyId, agentId],
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
    <>
      <div>
        <a
          href="https://vitejs.dev"
          target="_blank">
          <img
            src={viteLogo}
            className="logo"
            alt="Vite logo"
          />
        </a>
        <a
          href="https://react.dev"
          target="_blank">
          <img
            src={reactLogo}
            className="logo react"
            alt="React logo"
          />
        </a>
      </div>
      <h1>Apartment Sale</h1>
      <p>
        {!!property && (
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
              aria-label="apartment details table">
              <TableHead>
                <TableRow>
                  <TableCell>Title Number</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>On Sale</TableCell>
                  <TableCell>On Lease</TableCell>
                  <TableCell>Sell Price (MATIC)</TableCell>
                  <TableCell>Current Owner</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
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
                    {abbreviateAddress((property as PropertyDetails).owner)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </p>

      {/* <p>Parsel No: 2142</p>
      <p>Address: 113 gayBritish street, 20812</p>
      <p>Area: 70 meters square</p>
      <p>Price: 122k$</p> */}
      <button>See on Maps</button>

      <div className="card">
        {isConnected ? (
          <Button
            disabled={isLoading || isError}
            onClick={handleBuy}>
            Buy
          </Button>
        ) : (
          <w3m-connect-button />
        )}
      </div>
    </>
  );
}

export default App;
