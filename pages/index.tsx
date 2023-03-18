// Artist Demo
import { useContract, useAddress, Web3Button, ThirdwebNftMedia, useOwnedNFTs, useContractRead, } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import NFTCard from "../components/NFTcard";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const address = useAddress();
  
  const segAddress = "0xAbFc7687c1c2c55B39229c21de9B703dcd475E60";
  const stakingAddress = "0xB023493228cB8e6208E6A09491B62D7Ab3Bb956D";

  const { contract: segContract } = useContract(segAddress, "nft-drop");
  const { contract: stakingContract } = useContract(stakingAddress);

  const { data: mySegNFTs} = useOwnedNFTs (segContract, address);
  const { data: stakedSegNFT } = useContractRead(stakingContract, "getStakeInfo", address);

  async function stakeNFT(nftId: string) {
  if(!address) return;

  const isApproved = await segContract?.isApproved(
    address,
    stakingAddress
  );

  if (!isApproved) {
    await segContract?.setApprovalForAll(stakingAddress, true);
  }

  await stakingContract?.call ("stake", [nftId])
  }

  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();

  useEffect(() => {
    if(!stakingContract || !address) return;

    async function LoadClaimableRewads() {
      const stakeInfo = await stakingContract?.call("getStakeInfo", address);
      setClaimableRewards(stakeInfo[1]);
    }
    LoadClaimableRewads();
  }, [address, stakingContract]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>StakeEGG</h1>
        <Web3Button
          contractAddress={segAddress}
          action={(segContract) => segContract.erc721.claim(1)}
        >Clame EGG</Web3Button>
        <br />
        <h1>My NFT:</h1>
        <div>
          {mySegNFTs?.map (NFT => (
            <div>
              <h3>{NFT.metadata.name}</h3>
              <ThirdwebNftMedia
              metadata={NFT.metadata}
              height="100px"
              width="100px"
              />
              <Web3Button
              contractAddress={stakingAddress}
              action={() => stakeNFT(NFT.metadata.id)}
              >Stake NFT</Web3Button>
              </div>
          ))}
        </div>
        <h1>Steking EGG:</h1>
        <div>
          {stakedSegNFT && stakedSegNFT [0].map((stakeNFT: BigNumber) => (
            <div key={stakeNFT.toString()}>
              <NFTCard tokenId={stakeNFT.toNumber()} />
            </div>
          ))}
        </div>
        <br />
        <h1>Claimable $SEG</h1>
        {!claimableRewards ? "Losding..." : ethers.utils.formatUnits(claimableRewards, 18)}
        <Web3Button
         contractAddress={stakingAddress}
         action={(stakingContract) => stakingContract.call("claimRewards")}
        >Claim $SEG</Web3Button>
      </main>
    </div>
  );
};

export default Home;
