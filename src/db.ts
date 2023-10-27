import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({
    user: process.env.user,
    host: process.env.host,
    database: 'web2_lab1_63uh',
    password: process.env.password,
    port: 5432,
    ssl : true
})

export async function createComp(comp: number[][][], user: string = "user", scoring: number[], bye: boolean){
    await pool.query('insert into competitions values (default, $1, $2, $3, $4)', [JSON.stringify(comp), user, scoring, bye]);
}

export async function createPlayer(comp_id: number, id_in_comp: number, username: string){
    await pool.query('insert into players values (default, $1, $2, 0, $3)', [comp_id, id_in_comp, username]);
}

export async function createGame(comp_id: number, player1_id: number, player2_id: number, round: number){
    await pool.query('insert into games values (default, $1, $2, $3, $4, $5)', [comp_id, player1_id, player2_id, round, '']);
}

export async function getLastComp(){
    const result = await pool.query('select comp_id from competitions order by comp_id desc limit 1');
    return await result?.rows[0]?.comp_id;
}

export async function getComp(comp_id: number){
    const result = await pool.query('select * from competitions where comp_id = $1', [comp_id]);
    return await result?.rows[0];
}

export async function getPlayers(comp_id: number){
    const result = await pool.query('select username, points from players where comp_id = $1 order by points desc', [comp_id]);
    return result?.rows;
}

export async function getGames(comp_id: number){
    const result = await pool.query('select g.game_id, g.round, g.score, p1.username p1, p2.username p2 from games g join players p1 on g.player1_id = p1.id_in_comp and g.comp_id = p1.comp_id join players p2 on g.player2_id = p2.id_in_comp and g.comp_id = p2.comp_id where g.comp_id = $1 order by g.round, g.game_id', [comp_id]);
    return result?.rows;
}

export async function getGame(game_id: number){
    const result = await pool.query('select * from games where game_id = $1', [game_id]);
    return await result?.rows[0];
}

export async function updateGameScore(game_id: number, score: string){
    await pool.query('update games set score = $1 where game_id = $2', [score, game_id]);
}

export async function updatePlayerPoints(comp_id: number, player_id: number, points: number){
    await pool.query('update players set points = points + $1 where comp_id = $2 and id_in_comp = $3', [points, comp_id, player_id]);
}