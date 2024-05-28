const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()

const databasePath = path.join(__dirname, 'cricketMatchDetails.db')

app.use(express.json())
let database = null

const initlizeDbAndReverse = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initlizeDbAndReverse()

const convertDbObjectToPlayerDetailsObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  }
}
const convertDbObjectToMatchDetailsObject = dbObject => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT
    *
    FROM
    player_details;`

  const getPlayerArray = await database.all(getPlayersQuery)
  response.send(
    getPlayerArray.map(eachArray =>
      convertDbObjectToPlayerDetailsObject(eachArray),
    ),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuery = `
  SELECT
  *
  FROM
  player_details
  WHERE
  player_id = '${playerId}';`

  const getArray = await database.get(getPlayersQuery)
  response.send('Player Details Updated)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const updatePlayerQuery = `
  UPDATE
  player_details
  SET
  player_name = '${playerName}'
  WHERE
  player_id = '${playerId}';`

  const updatedArray = await database.run(updatePlayerQuery)
  response.send(convertDbObjectToPlayerDetailsObject(updatedArray))
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchQuerry = `
  SELECT
  *
  FROM
  match_details
  WHERE
  match_id = '${matchId}';`

  const getArray = await database.get(getMatchQuerry)
  response.send(
    getArray.map(eachArray => convertDbObjectToMatchDetailsObject(eachArray)),
  )
})

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuerry = `
  SELECT
  *
  FROM
  player_match_score NATURAL JOIN match_details
  WHERE
  player_id = '${playerId}';`

  const getArray = await database.all(getPlayerQuerry)
  response.send(convertDbObjectToPlayerDetailsObject(getArray))
})

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getMatchQuerry = `
  SELECT
  *
  FROM 
  player_match_score NATURAL JOIN player_details
  WHERE
  match_id = '${matchId}';`

  const getArray = await database.all(getMatchQuerry)
  response.send(
    getArray.map(eachArray => convertDbObjectToMatchDetailsObject(eachArray)),
  )
})

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuerry = `
  SELECT
  player_id AS '${playerId}',
  player_name AS '${playerName}',
  SUM(scores) AS '${totalScores}',
  SUM(fours) AS '${totalFours}',
  SUM(sixes) AS '${totalSixes}'
  
  FROM
   player_match_score NATURAL JOIN player_details
  WHERE
  player_id = '${playerId}';`

  const getArray = await database.all(getPlayerQuerry)
  response.send(getArray )
})
module.exports = app
