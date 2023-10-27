import { createComp, getLastComp, createPlayer, createGame } from './db';

export async function roundRobin(players: string[], scoring: number[], username: string | undefined) {
    var compm: number[][][];
    //var comp: String;
    if (players.length == 4) {
        compm = [[[1, 4], [2, 3]],
                [[2, 1], [3, 4]],
                [[1, 3], [4, 2]]];
        //comp = "1,4,2,3,2,1,3,4,1,3,4,2";
    }
    else{
        if (players.length === 5 || players.length === 6) {
            compm = [[[1, 6], [2, 5], [3, 4]],        //prvo kolo: 1-6, 2-5, 3-4
                    [[2, 1], [3, 6], [4, 5]],        //drugo kolo
                    [[1, 3], [4, 2], [5, 6]],        //trece kolo
                    [[4, 1], [5, 3], [6, 2]],
                    [[1, 5], [6, 4], [2, 3]]];
            //comp = "1,6,2,5,3,4,2,1,3,6,4,5,1,3,4,2,5,6,4,1,5,3,6,2,1,5,6,4,2,3";
        }   
        else {
            compm = [[[1, 8], [2, 7], [3, 6], [4, 5]],
                    [[2, 1], [3, 8], [4, 7], [5, 6]],
                    [[1, 3], [4, 2], [5, 8], [6, 7]],
                    [[4, 1], [5, 3], [6, 2], [7, 8]],
                    [[1, 5], [6, 4], [7, 3], [8, 2]],
                    [[6, 1], [7, 5], [8, 4], [2, 3]],
                    [[1, 7], [8, 6], [2, 5], [3, 4]]];
            //comp = "1,8,2,7,3,6,4,5,2,1,3,8,4,7,5,6,1,3,4,2,5,8,6,7,4,1,5,3,6,2,7,8,1,5,6,4,7,3,8,2,6,1,7,5,8,4,2,3,1,7,8,6,2,5,3,4";
        }
    }
    var bye: boolean = false;
    if (players.length === 5 || players.length === 7) bye = true;
    await createComp(compm, username, scoring, bye);
    var comp_id: number = 0;
    await getLastComp().then((val) => comp_id = val);

    for (let i = 0; i < players.length; i++) {
        await createPlayer(comp_id, i + 1, players[i]);
    }

    for(var i = 0; i < compm.length; i++) {
        var c = compm[i];
        for(var j = 0; j < c.length; j++) {
            if ((players.length !== 5 || (c[j][0] !== 6 && c[j][1] !== 6)) && (players.length !== 7 || (c[j][0] !== 8 && c[j][1] !== 8)))
                createGame(comp_id, c[j][0], c[j][1], i + 1);
        }
    }
    
}
