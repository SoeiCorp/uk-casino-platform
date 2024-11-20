import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv'; 

dotenv.config();
const { API_URL, PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
    solidity: "0.8.27",
    defaultNetwork: "sepolia",
    networks: {
        hardhat: {},
        sepolia: {
            url: API_URL as string,
            accounts: [`0x${PRIVATE_KEY}`],
        },
    },
};

export default config;
