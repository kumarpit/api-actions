import { AxiosInstance, AxiosResponse } from "axios";

const Network = {
    post: async(axios: AxiosInstance, {
        path,
        body
    }: any): Promise<AxiosResponse> => {
        const res = await axios.post(
			path,
			body
		);
        return res;
    },
    get: async(axios: AxiosInstance, {
        path
    }: any): Promise<AxiosResponse> => {
        const res = await axios.get(
            path
        );
        return res;
    }
}

export default Network