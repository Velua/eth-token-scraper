import axios from 'axios';

export const getHtml = async (url: string) => {
    const res = await axios.get(url);
    return res.data;
}
