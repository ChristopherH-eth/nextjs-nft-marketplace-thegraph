import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { Form, useNotification } from "@web3uikit/core"
import { ethers } from "ethers"
import nftAbi from "../constants/BasicNft.json"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { useMoralis, useWeb3Contract } from "react-moralis"
import networkMapping from "../constants/networkMapping.json"

/**
 * @notice The Home() function returns the elements to be displayed on the current NFT
 * Marketplace page.
 */

export default function Home() {
    const { chainId } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const dispatch = useNotification()

    const { runContractFunction } = useWeb3Contract()

    /**
     * @notice The approveAndList() function takes the data parameter from the NFT list form and uses it to
     * approve and list the NFT on the marketplace.
     * @param data The array of information passed from a user submission of the list NFT form.
     */

    async function approveAndList(data) {
        console.log("Approving...")

        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }

        /**
         * @notice The runContractFunction() function executes the approval function for the listing transaction,
         * and if successful, executes the listing.
         */

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => console.log(error),
        })
    }

    /**
     * @notice The handleApproveSuccess() function handles a successful NFT listing approval and lists the NFT
     * on the marketplace.
     * @param nftAddress The address of the NFT being listed.
     * @param tokenId The Token ID of the NFT being listed.
     * @param price The listing price of the NFT being listed.
     */

    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("Listing NFT...")

        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        }

        /**
         * @notice The runContractFunction() function executes the listing function for the NFT.
         */

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (error) => console.log(error),
        })
    }

    async function handleListSuccess() {
        dispatch({
            type: "success",
            message: "NFT Listing",
            title: "NFT Listed",
            position: "topR",
        })
    }

    // Page Content
    return (
        <div className={styles.container}>
            <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "NFT Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Token ID",
                        type: "number",
                        value: "",
                        key: "tokenId",
                    },
                    {
                        name: "Price (in ETH)",
                        type: "number",
                        value: "",
                        key: "price",
                    },
                ]}
                title="Sell your NFT!"
                id="Main Form"
            />
        </div>
    )
}
