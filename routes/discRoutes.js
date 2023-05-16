const router = express.Router();
import express from 'express';
import { boughtListing, buyDisc, buyingDiscs, cancelDisc, deleteDisc, editDisc, getActiveDiscs, getActiveDiscs2, getAllDiscsWithSellers, getBrand, getDiscBids, getFinishedDiscs, getFinishedDiscs2, postBid, postDisc, reListDisc, sellingDiscs } from '../controllers/discController.js';

router.get('/getBrand', getBrand);
router.post('/', postDisc);
router.delete('/delete/:discId', deleteDisc);
router.post('/cancel/:discId', cancelDisc);
router.post('/edit/:discId', editDisc);
router.post('/relist/:discId', reListDisc);
router.get('/', getAllDiscsWithSellers);
router.post('/bid', postBid);
router.post('/buy', buyDisc);
router.get('/buying/:userId', buyingDiscs);
router.get('/selling/:userId', sellingDiscs);
router.get('/getBids/:discId/bids', getDiscBids);
router.get('/getActiveDiscs/:userId', getActiveDiscs);
router.get('/getActiveDiscs2/:userId/:userCurrency', getActiveDiscs2);
router.get('/getFinishedDiscs/:userId', getFinishedDiscs);
router.get('/getFinishedDiscs2/:userId/:userCurrency', getFinishedDiscs2);
router.get('/boughtListing/:buyerId', boughtListing);

export default router;