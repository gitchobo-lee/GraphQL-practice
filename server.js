import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";
let tweets = [
  {
    id: "1",
    text: "first one",
    userId: "2",
  },
  {
    id: "2",
    text: "second one",
    userId: "1",
  },
];
let users = [
  {
    id: "1",
    firstName: "nico",
    lastName: "las",
  },
  {
    id: "2",
    firstName: "Elon",
    lastName: "Musk",
  },
];

const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    """
    Is the sum of firstName + lastName as a string
    """
    fullName: String!
  }
  """
  Tweet object represents a resource for a Tweet
  """
  type Tweet {
    id: ID!
    text: String!
    author: User
  }
  type Query {
    allUsers: [User!]!
    allMovies: [Movie!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    movie(id: String!): Movie
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    deleteTweet(id: ID!): Boolean!
  }
  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }
`;
//큰따옴표 3개를 붙이고 설명을 적으면, 다음 줄에 있는 필드에 대한 설명이 schema에 나타난다. 예를 들어, Tweet object~~는 아래쪽의 Tweet를 꾸며준다.
const resolvers = {
  Query: {
    allTweets() {
      return tweets;
    },
    tweet(root, { id }) {
      return tweets.find((tweet) => tweet.id === id);
    },
    allUsers() {
      return users;
    },
    allMovies() {
      return fetch("https://yts.mx/api/v2/list_movies.json")
        .then((r) => r.json())
        .then((json) => json.data.movies);
    },
    movie(root, { id }) {
      return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
        .then((r) => r.json())
        .then((json) => json.data.movie);
    },
  },
  Mutation: {
    postTweet(root, { text, userId }) {
      const newTweet = {
        id: tweets.length + 1,
        text,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(root, { id }) {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    fullName({ firstName, lastName }) {
      return `${firstName} ${lastName}`;
    },
  },
  Tweet: {
    author({ userId }) {
      return users.find((user) => user.id === userId);
    },
  },
};
//resolver function에서 첫 번째 argument는 항상 root이다. 두번째부터 진짜 argument
//Tweet안의 User은 하나만 넘겨주겠다는 얘기고, Query의 [Tweet]은 여러 개의 Tweet 개체를 넘겨주겠다는 뜻
//Tweet 안의 tweet은 id라는 argument가 특정되어야 정보를 넘겨준다. Rest API의 /:id와 기능이 같음
//SDL (schema defenition language) 쓰는 자리. 데이터의 모양을 설명하는 자리. 반드시 `을 써야함
//Query에 대한 type은 반드시 존재해야한다.
//Query에 넣는 정보는 rest API에서 GET request url을 노출시키는 것과 같다. 요청할 수 있는 모든 자료들의 이름을 여기에 넣는다.
//Mutation에 넣는 정보는 rest API에서 POST와 같은 기능을 한다.
//느낌표의 역할: 쿼리가 null값을 줄 수 없게 만든다.
const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
