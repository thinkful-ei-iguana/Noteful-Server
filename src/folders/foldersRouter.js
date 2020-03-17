const express = require('express');
const path = require('path');
const xss = require('xss');
const foldersService = require('./foldersService')

const foldersRouter = express.Router();
const jsonParser = express.json();

function serializeFolder(folder) {
  return {
    id: folder.id,
    folder_name: xss(folder.folder_name),
    note_id: xss(folder.note_id),
    date_modified: folder.date_modified,
  };
}

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    foldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { folder_name } = req.body;
    const newFolder = { folder_name };

    for (const [key, value] of Object.entries(newFolder))
      if(value === null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
      foldersService.insertFolder (
        req.app.get('db'),
        newFolder
      )
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(folder);
      })
      .catch(next);
  })

  foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
      foldersService.getById(
        req.app.get('db'),
        req.params.folder_id
      )
      .then(folder => {
        if(!folder) {
          return res.status(404).json({
            error: { message: 'Folder does not exist' }
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next)
    })
    .get((req, res, next) => {
      res.json(serializeFolder(res.folder));
    })
    .delete((req, res, next) => {
      foldersService.deleteFolder(
        req.app.get('db'),
        req.params.folder_id
      )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
      const { folder_name, note_id } = req.body;
      const folderToUpdate = { folder_name, note_id };

      const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
      if (numberOfValues === 0) {
        return res.status(400).json({
          error: {
            message: 'Request body must contain either \'folder_name\' or \note\''
          }
        });
      }
      foldersService.updateFolder(
        req.app.get('db'),
        req.params.folder_id, 
        folderToUpdate
      )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
    });

  module.exports = foldersRouter;