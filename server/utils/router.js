import { Router } from "express";
import { findTrainers, upsertTrainer, findTrainer, deleteTrainer, } from "~/server/utils/trainer";
import { findPokemon } from "~/server/utils/pokemon";

const router = Router();

router.get("/hello", (_req, res) => {
  res.send("Hello World");
});

/*
// トレーナー名の一覧の取得 Trial
router.get("/trainers", (_req, res, next) => {
  try {
    const trainers = await findTrainers();
    //const trainers = ["trainer1","trainer2","trainer3","trainer4"];
    res.send(trainers);
  } catch (err) {
    next(err);
  }
});
*/

/** トレーナー名の一覧の取得 */
router.get("/trainers", async (_req, res, next) => {
  try {
    const trainers = await findTrainers();
    // TODO: 期待するレスポンスボディに変更する
    const trainerNames = trainers.map(({ Key }) => Key.replace(/\.json$/, ""));
    res.send(trainerNames);
  } catch (err) {
    next(err);
  }
});


/** トレーナーの追加 */
router.post("/trainer", async (req, res, next) => {
  try {
    // TODO: リクエストボディにトレーナー名が含まれていなければ400を返す    
    if (!("name" in req.body && req.body.name.length > 0))
      return res.sendStatus(400).send('No trainer name given.');

    // TODO: すでにトレーナー（S3 オブジェクト）が存在していれば409を返す
    const trainers = await findTrainers();
    const trainerExists = trainers.some(({ Key }) => Key === `${req.body.name}.json`);
    if (trainerExists) {
      return res.sendStatus(409).send('Trainer already exists.');
    }
    const result = await upsertTrainer(req.body.name, req.body);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの取得 */
// TODO: トレーナーを取得する API エンドポイントの実装
router.get("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    const trainer = await findTrainer(trainerName);
    res.send(trainer);
  } catch (err) {
    next(err);
  }
});

/** トレーナーの更新 */
router.post("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    // TODO: トレーナーが存在していなければ404を返す    
        const trainers = await findTrainers();        
        const trainerExists = trainers.some(({ Key }) => Key === `${trainerName}.json`);

        if (!trainerExists) {
          return res.sendStatus(404).send('Trainer not found.');
        }
      
        const result = await upsertTrainer(trainerName, req.body);
        res.status(result["$metadata"].httpStatusCode).send(result);
      } catch (err) {
        next(err);
      }
    });

/** トレーナーの削除 */
// TODO: トレーナーを削除する API エンドポイントの実装
router.delete("/trainer/:trainerName", async (req, res, next) => {
  try {
    const { trainerName } = req.params;
    const result = await deleteTrainer(trainerName);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    next(err);
  }
});


/** ポケモンの追加 */
router.post("/trainer/:trainerName/pokemon", async (req, res, next) => {
  try {
    console.log("start /pokemon");
    console.log(req.body)
    const { trainerName } = req.params;    
    // TODO: リクエストボディにポケモン名が含まれていなければ400を返す
    if (!("name" in req.body && req.body.name.length > 0))
      return res.sendStatus(400).send('No Pokémon name given.');

    const pokemon = await findPokemon(req.body.name);

    // TODO: 削除系 API エンドポイントを利用しないかぎりポケモンは保持する
    const {
      order,
      name,
      sprites: { front_default },
    } = pokemon;
    
    const trainer = await findTrainer(trainerName);
    const newPokemon = {
      id: (trainer.pokemons[trainer.pokemons.length - 1]?.id ?? 0) + 1,
      nickname: "",
      order,
      name,
      sprites: { front_default },
    };

    trainer.pokemons.push(newPokemon);

    //const result = await upsertTrainer(trainerName, { pokemons: [pokemon] });
    const result = await upsertTrainer(trainerName, trainer);
    res.status(result["$metadata"].httpStatusCode).send(result);
  } catch (err) {
    console.log("err /pokemon");
    next(err);
  }
});

/** ポケモンの削除 */
// TODO: ポケモンを削除する API エンドポイントの実装
router.delete(
  "/trainer/:trainerName/pokemon/:pokemonId",
  async (req, res, next) => {
    try {
      const { trainerName, pokemonId } = req.params;
      const trainer = await findTrainer(trainerName);
      const index = trainer.pokemons.findIndex(
        (pokemon) => String(pokemon.id) === pokemonId,
      );
      trainer.pokemons.splice(index, 1);
      const result = await upsertTrainer(trainerName, trainer);
      res.status(result["$metadata"].httpStatusCode).send(result);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
