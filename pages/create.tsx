import React, { FormEvent, useState } from "react";
import Header from "../components/Header";
import {
  useAddress,
  useContract,
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useOwnedNFTs,
  useCreateAuctionListing,
  useAcceptDirectListingOffer,
  useCreateDirectListing,
} from "@thirdweb-dev/react";
import { ChainId, NFT , NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS} from "@thirdweb-dev/sdk";
import Network from "../utils/network";
import { useRouter } from "next/router";
type Props = {};

function Create({}: Props) {
  const address = useAddress();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTACT,
    "marketplace"
  );

  const [selectedNft, setSelectedNft] = useState<NFT>();
  const { contract: collectionContract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTACT,
    "nft-collection"
  );

  const router = useRouter()
  const ownedNfts = useOwnedNFTs(collectionContract, address);

  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const {
    mutate: CreateDirectListing,
    isLoading,
    error,
  } = useCreateDirectListing(contract);
  const {
    mutate: CreateAuctionListing,
    isLoading: isLoadingDrirect,
    error: errorDirect,
  } = useCreateAuctionListing(contract);

  const handleCreateListing = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (networkMismatch) {
      switchNetwork && switchNetwork(Network);
      return;
    }
    if (!selectedNft) return;

    const target = e.target as typeof e.target & {
      elements: { listingType: { value: string }; price: { value: string } };
    };

    const { listingType, price } = target.elements;

    if (listingType.value === "directListing") {
      CreateDirectListing({
        assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTACT!,
        tokenId: selectedNft.metadata.id,
        currencyContractAddress: NATIVE_TOKEN_ADDRESS,
        listingDurationInSeconds: 60 * 60 *24 *7,
        quantity: 1,
        buyoutPricePerToken: price.value,
        startTimestamp: new Date()
      }, {
        onSuccess(data, variable, context){
          console.log('SUCCESS: ', data, variable, context)
          router.push('/')
        },
        onError(error, variable, context){
          console.log("ERROR: ", error, variable, context)
        }
      })
    }

    if(listingType.value === 'auctionListing'){
      CreateAuctionListing({
        assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTACT!,
        buyoutPricePerToken: price.value,
        tokenId: selectedNft.metadata.id,
        currencyContractAddress: NATIVE_TOKEN_ADDRESS,
        listingDurationInSeconds: 60 * 60 *24 *7,
        quantity: 1,
        reservePricePerToken: 0,
        startTimestamp: new Date()
      },{
        onSuccess(data, variable, context){
          console.log('SUCCESS: ', data, variable, context)
          router.push('/')
        },
        onError(error, variable, context){
          console.log("ERROR: ", error, variable, context)
        }
      })
    }
  };
  return (
    <div>
      <Header />

      <main className="max-w-6xl mx-auto p-10 pt-2">
        <h1 className="text-4xl font-bold">List an Item</h1>
        <h2 className="text-xl font-semibold pt-5">
          Select an Item you would like to sell
        </h2>
        <hr className="mb-5" />

        <p>Below you will find the Nft you Own in your wallet</p>

        <div className="flex overflow-x-scroll space-x-2 p-4">
          {ownedNfts?.data?.map((nft) => (
            <div
              key={nft.metadata.id}
              onClick={() => setSelectedNft(nft)}
              className={`flex flex-col space-y-2 card min-w-fit border-2 bg-gray-100 ${
                nft.metadata.id === selectedNft?.metadata.id
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              <MediaRenderer
                className="h-48 rounded-lg"
                src={nft.metadata.image}
              />
              <p className="text-lg truncate font-bold">{nft.metadata.name}</p>
              <p className="text-xs truncate">{nft.metadata.description}</p>
            </div>
          ))}
        </div>

        {selectedNft && (
          <form onSubmit={handleCreateListing}>
            <div className="flex flex-col p-10">
              <div className="grid grid-cols-2 gap-5">
                <label className="border-r font-light">
                  Direct Listring / Fixed Price
                </label>
                <input
                  type="radio"
                  name="listingType"
                  value="directListing"
                  className="ml-auto h-10 w-10"
                />

                <label className="border-r font-light">Auction</label>
                <input
                  type="radio"
                  name="listingType"
                  value="auctionListing"
                  className="ml-auto h-10 w-10"
                />

                <label className="border-r font-light">Price</label>
                <input
                  type="text"
                  placeholder="0.05"
                  className="bg-gray-100 outline-none p-5"
                  name="price"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg p-4 mt-8"
              >
                Create Listing
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default Create;
