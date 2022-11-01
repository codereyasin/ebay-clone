import React, { FormEvent, useState } from "react";
import Header from "../components/Header";
import { useAddress, useContract } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
type Props = {};

function addItem({}: Props) {
  const address = useAddress();
  const router = useRouter()
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTACT,
    "nft-collection"
  );
  const [preview, setPreview] = useState<String>();
  const [image, setImage] = useState<File>();

  const mintNft = async (e: FormEvent<HTMLFormElement>) => {
    
    e.preventDefault()
    if(!contract || !address) return

    if(!image){
        alert('Please select an image') 
        return
    }
    const target = e.target as typeof e.target  & {
        name: {value: string}
        description: {value: string}
    }
    const metadata = {
        name: target.name.value,
        description: target.description.value,
        image: image,
    }
    try {
        const tx = await contract.mintTo(address, metadata)
        const receipt = tx.receipt
        const tokenId = tx.id
        const nft = await tx.data()
        console.log(receipt, tokenId, nft)
        router.push('/')

    } catch (error) {
        console.log(error)
    }
  }
  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto p-10 border">
        <h1 className="text-4xl font-bold">Add an Item to Marketplace</h1>
        <h2 className="text-xl font-semibold">Item Details</h2>
        <p className="pb-5">
          By adding an item to the marketplace, you're essentially Minting an
          Nft of the item into your wallet which can then list for sele!
        </p>
        <div className="flex flex-col justify-center items-center md:flex-row md:space-x-5 pt-5">
          <img
            className="border h-80 w-80 object-contain"
            src={`${preview ? preview : "https://links.papareact.com/ucj"} `}
            alt=""
          />
          <form onSubmit={mintNft} className="flex flex-col flex-1 p-2 space-y-2 ">
            <label className="font-light">Name of Item</label>
            <input
              className="formField"
              type="text"
              name="name"
              id="name"
              placeholder="Name of Item.."
            />

            <label className="font-light">Description</label>
            <input
              className="formField"
              name="description"
              id="description"
              type="text"
              placeholder="Enter Description.."
            />

            <label className="font-light">Image of the Item</label>
            <input
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setPreview(URL.createObjectURL(e.target.files?.[0]));
                  setImage(e.target.files[0]);
                }
              }}
              type="file"
            />

            <button type='submit' className="bg-blue-600 text-white rounded-full py-4 px-10 w-56 mt-auto md:ml-auto mx-auto font-bold">
              Add/Mint Item
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default addItem;
