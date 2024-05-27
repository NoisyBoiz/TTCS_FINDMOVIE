import Common from './common.js';

const genresService = {
    async getAllGenres() {
        const url = '/genres/list';
        const res = await Common.getMethod(url);
        return res.data;
    },     
}

export default genresService;