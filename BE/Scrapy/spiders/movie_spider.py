import scrapy
import pymongo

myclient = pymongo.MongoClient("mongodb://localhost:27017/")
myDB = myclient["Movies"]

moviesDetailEnTB = myDB["movies_detail_ens"]
moviesDetailViTB = myDB["movies_detail_vis"]
moviesDetailJaTB = myDB["movies_detail_jas"]
moviesDetailRuTB = myDB["movies_detail_rus"]
movieTB = myDB["movies"]
castTB = myDB["casts"]

upcomingTB = myDB["upcomings"]
popularTB = myDB["populars"]
trendingDayTB = myDB["trending_days"]
trendingWeekTB = myDB["trending_weeks"]
theatresTB = myDB["theatres"]

key = "dee9abb4ea6e2eed872d9951aa2a0cc3"
listGenres = [
    {"_id": 1, "name": "Action", "preId": 28},
    {"_id": 2, "name": "Adventure", "preId": 12},
    {"_id": 3, "name": "Animation", "preId": 16},
    {"_id": 4, "name": "Comedy", "preId": 35},
    {"_id": 5, "name": "Crime", "preId": 80},
    {"_id": 6, "name": "Documentary", "preId": 99},
    {"_id": 7, "name": "Drama", "preId": 18},
    {"_id": 8, "name": "Family", "preId": 10751},
    {"_id": 9, "name": "Fantasy", "preId": 14},
    {"_id": 10, "name": "History", "preId": 36},
    {"_id": 11, "name": "Horror", "preId": 27},
    {"_id": 12, "name": "Music", "preId": 10402},
    {"_id": 13, "name": "Mystery", "preId": 9648},
    {"_id": 14, "name": "Romance", "preId": 10749},
    {"_id": 15, "name": "Thriller", "preId": 53},
    {"_id": 16, "name": "War", "preId": 10752},
    {"_id": 17, "name": "Western", "preId": 37},
    {"_id": 18, "name": "Science Fiction", "preId": 878}
]

def formatGenres(genres):
    listId = []
    for preGen in genres:
        for newGen in listGenres:
            if preGen["id"] == newGen["preId"]:
                listId.append(newGen["_id"])
                break
    return listId

def formatVideo(videos):
    listVideo = []
    listType = ["featurette", "Trailer", "Teaser"]
    for video in videos:
        if video["type"] in listType:
            listVideo.append(video["key"])
    return listVideo

def formatCast(cast):
    return {
        "_id": cast["id"],
        "name": cast["name"],
        "avatar": cast["profile_path"]
    }

def getCast(movie):
    listCast = []
    for cast in movie["credits"]["cast"]:
        castCheck = castTB.find_one({"_id": cast["id"]})
        if castCheck is None:
            castTB.insert_one(formatCast(cast))
        listCast.append({
            "id": cast["id"],
            "character": cast["character"],
        })
    return listCast

def formatMovie(movie):
    return {
        "_id": movie["id"],
        "release_date": movie["release_date"],
        "poster_path": movie["poster_path"],
        "backdrop_path": movie["backdrop_path"],
        "vote_average": movie["vote_average"],
        "vote_count": movie["vote_count"],
        "genre_ids": formatGenres(movie["genres"]),
        "runtime": movie["runtime"],
        "listCast": getCast(movie),
        "original_title": movie["original_title"] if "original_title" in movie else movie["original_name"],
    }

def formatMovieDetail(movie):
    return {
        "_id": movie["id"],
        "title": movie["title"] if "title" in movie else movie["name"],
        "overview": movie["overview"],
        "video": formatVideo(movie["videos"]["results"]),
    }

class QuotesSpider(scrapy.Spider):
    name = "movie_spider"

    def start_requests(self):
        listUrls = [
            {
                'url': "https://api.themoviedb.org/3/movie/upcoming?api_key="+key+"&language=en&page=1",
                'collection': upcomingTB
            },
            {
                'url': "https://api.themoviedb.org/3/movie/popular?api_key="+key+"&language=en&page=1",
                'collection': popularTB
            },
             {
                'url': "https://api.themoviedb.org/3/movie/popular?api_key="+key+"&language=en&page=2",
                'collection': popularTB
            },
            {
                'url': "https://api.themoviedb.org/3/trending/movie/day?api_key="+key,
                'collection': trendingDayTB
            },
            {
                'url': "https://api.themoviedb.org/3/trending/movie/week?api_key="+key,
                'collection': trendingWeekTB
            },
            {
                'url': "https://api.themoviedb.org/3/movie/now_playing?api_key="+key+"&language=en&page=1",
                'collection': theatresTB
            },
            {
                'url': "https://api.themoviedb.org/3/movie/now_playing?api_key="+key+"&language=en&page=2",
                'collection': theatresTB
            }
        ]
        for url in listUrls:
            yield scrapy.Request(url=url['url'], callback=self.getDetails, cb_kwargs={"collection": url["collection"]})

    def getDetails(self, response, collection):
        data = response.json()["results"]
        for movie in data:
            if(movieTB.find_one({"_id": movie["id"]}) is None):
                listLanguage = ["en", "vi", "ja", "ru"]
                for language in listLanguage:
                    url = "https://api.themoviedb.org/3/movie/"+str(movie["id"])+"?api_key="+key+"&language="+language+"&append_to_response=videos,credits"
                    yield scrapy.Request(url=url, callback=self.insertDetail, cb_kwargs={"language": language})
            if(collection.find_one({"id_movie": movie["id"]}) is None):
                collection.insert_one({"id_movie": movie["id"]})

    def insertDetail(self, response, language):
        movieDetail = response.json()
        if("status_code" in movieDetail and movieDetail["status_code"] == 34): return
        if language == "en":
            moviesDetailEnTB.insert_one(formatMovieDetail(movieDetail))
            movieTB.insert_one(formatMovie(movieDetail))
        elif language == "vi":
            moviesDetailViTB.insert_one(formatMovieDetail(movieDetail))
        elif language == "ja":
            moviesDetailJaTB.insert_one(formatMovieDetail(movieDetail))
        elif language == "ru":
            moviesDetailRuTB.insert_one(formatMovieDetail(movieDetail))

