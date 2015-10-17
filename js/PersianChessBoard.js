/*
  _____              _                _____ _                   
 |  __ \            (_)              / ____| |                  
 | |__) |__ _ __ ___ _  __ _ _ __   | |    | |__   ___  ___ ___ 
 |  ___/ _ \ '__/ __| |/ _` | '_ \  | |    | '_ \ / _ \/ __/ __|
 | |  |  __/ |  \__ \ | (_| | | | | | |____| | | |  __/\__ \__ \
 |_|   \___|_|  |___/_|\__,_|_| |_|  \_____|_| |_|\___||___/___/
                                                                
----------------------------------------------------------------
 Persian Chess (www.PersianChess.com)
 Copyright 2014 Anooshiravan Ahmadi - MCE @ Schuberg Philis
 Released under the GPL license
 Based on the open source projects mentioned at:
 http://www.PersianChess.com/About
 Redistribution of this game design, rules and the engine 
 requires written permission from the author.
----------------------------------------------------------------
*/

/*!
 * chessboard.js v0.3.0
 *
 * Copyright 2013 Chris Oakman
 * Released under the MIT license
 * http://chessboardjs.com/license
 *
 * Date: 10 Aug 2013
 */


// start anonymous scope
;
(function () {
    'use strict';
    //------------------------------------------------------------------------------
    // Define 85SQ board squares
    //------------------------------------------------------------------------------

    var thinking = false;
    var SQ85 = new Array();

    // row 1
    SQ85[0] = "off";
    SQ85[1] = "off";
    SQ85[2] = "off";
    SQ85[3] = "off";
    SQ85[4] = "off";
    SQ85[5] = "off";
    SQ85[6] = "off";
    SQ85[7] = "off";
    SQ85[8] = "off";
    SQ85[9] = "off";
    SQ85[10] = "off";
    SQ85[11] = "off";
    SQ85[12] = "off";

    // row 2
    SQ85[13] = "off";
    SQ85[14] = "off";
    SQ85[15] = "off";
    SQ85[16] = "off";
    SQ85[17] = "off";
    SQ85[18] = "off";
    SQ85[19] = "off";
    SQ85[20] = "off";
    SQ85[21] = "off";
    SQ85[22] = "off";
    SQ85[23] = "off";
    SQ85[24] = "off";
    SQ85[25] = "off";

    // row 3
    SQ85[26] = "off";
    SQ85[27] = "a11"; //
    SQ85[28] = "off";
    SQ85[29] = "off";
    SQ85[30] = "off";
    SQ85[31] = "off";
    SQ85[32] = "off";
    SQ85[33] = "off";
    SQ85[34] = "off";
    SQ85[35] = "off";
    SQ85[36] = "off";
    SQ85[37] = "k11"; //
    SQ85[38] = "off";

    // row 4
    SQ85[39] = "off";
    SQ85[40] = "off";
    SQ85[41] = "b10";
    SQ85[42] = "c10";
    SQ85[43] = "d10";
    SQ85[44] = "e10";
    SQ85[45] = "f10";
    SQ85[46] = "g10";
    SQ85[47] = "h10";
    SQ85[48] = "i10";
    SQ85[49] = "j10";
    SQ85[50] = "off";
    SQ85[51] = "off";

    // row 5    
    SQ85[52] = "off";
    SQ85[53] = "off";
    SQ85[54] = "b9";
    SQ85[55] = "c9";
    SQ85[56] = "d9";
    SQ85[57] = "e9";
    SQ85[58] = "f9";
    SQ85[59] = "g9";
    SQ85[60] = "h9";
    SQ85[61] = "i9";
    SQ85[62] = "j9";
    SQ85[63] = "off";
    SQ85[64] = "off";

    // row 6
    SQ85[65] = "off";
    SQ85[66] = "off";
    SQ85[67] = "b8";
    SQ85[68] = "c8";
    SQ85[69] = "d8";
    SQ85[70] = "e8";
    SQ85[71] = "f8";
    SQ85[72] = "g8";
    SQ85[73] = "h8";
    SQ85[74] = "i8";
    SQ85[75] = "j8";
    SQ85[76] = "off";
    SQ85[77] = "off";

    // row 7
    SQ85[78] = "off";
    SQ85[79] = "off";
    SQ85[80] = "b7";
    SQ85[81] = "c7";
    SQ85[82] = "d7";
    SQ85[83] = "e7";
    SQ85[84] = "f7";
    SQ85[85] = "g7";
    SQ85[86] = "h7";
    SQ85[87] = "i7";
    SQ85[88] = "j7";
    SQ85[89] = "off";
    SQ85[90] = "off";

    // row 8    
    SQ85[91] = "off";
    SQ85[92] = "off";
    SQ85[93] = "b6";
    SQ85[94] = "c6";
    SQ85[95] = "d6";
    SQ85[96] = "e6";
    SQ85[97] = "f6";
    SQ85[98] = "g6";
    SQ85[99] = "h6";
    SQ85[100] = "i6";
    SQ85[101] = "j6";
    SQ85[102] = "off";
    SQ85[103] = "off";

    // row 9    
    SQ85[104] = "off";
    SQ85[105] = "off";
    SQ85[106] = "b5";
    SQ85[107] = "c5";
    SQ85[108] = "d5";
    SQ85[109] = "e5";
    SQ85[110] = "f5";
    SQ85[111] = "g5";
    SQ85[112] = "h5";
    SQ85[113] = "i5";
    SQ85[114] = "j5";
    SQ85[115] = "off";
    SQ85[116] = "off";

    // row 10
    SQ85[117] = "off";
    SQ85[118] = "off";
    SQ85[119] = "b4";
    SQ85[120] = "c4";
    SQ85[121] = "d4";
    SQ85[122] = "e4";
    SQ85[123] = "f4";
    SQ85[124] = "g4";
    SQ85[125] = "h4";
    SQ85[126] = "i4";
    SQ85[127] = "j4";
    SQ85[128] = "off";
    SQ85[129] = "off";

    // row 11
    SQ85[130] = "off";
    SQ85[131] = "off";
    SQ85[132] = "b3";
    SQ85[133] = "c3";
    SQ85[134] = "d3";
    SQ85[135] = "e3";
    SQ85[136] = "f3";
    SQ85[137] = "g3";
    SQ85[138] = "h3";
    SQ85[139] = "i3";
    SQ85[140] = "j3";
    SQ85[141] = "off";
    SQ85[142] = "off";

    // row 12
    SQ85[143] = "off";
    SQ85[144] = "off";
    SQ85[145] = "b2";
    SQ85[146] = "c2";
    SQ85[147] = "d2";
    SQ85[148] = "e2";
    SQ85[149] = "f2";
    SQ85[150] = "g2";
    SQ85[151] = "h2";
    SQ85[152] = "i2";
    SQ85[153] = "j2";
    SQ85[154] = "off";
    SQ85[155] = "off";

    // row 13
    SQ85[156] = "off";
    SQ85[157] = "a1";
    SQ85[158] = "off";
    SQ85[159] = "off";
    SQ85[160] = "off";
    SQ85[161] = "off";
    SQ85[162] = "off";
    SQ85[163] = "off";
    SQ85[164] = "off";
    SQ85[165] = "off";
    SQ85[166] = "off";
    SQ85[167] = "k1";
    SQ85[168] = "off";

    // row 14
    SQ85[169] = "off";
    SQ85[170] = "off";
    SQ85[171] = "off";
    SQ85[172] = "off";
    SQ85[173] = "off";
    SQ85[174] = "off";
    SQ85[175] = "off";
    SQ85[176] = "off";
    SQ85[177] = "off";
    SQ85[178] = "off";
    SQ85[179] = "off";
    SQ85[180] = "off";
    SQ85[181] = "off";

    // row 15
    SQ85[182] = "off";
    SQ85[183] = "off";
    SQ85[184] = "off";
    SQ85[185] = "off";
    SQ85[186] = "off";
    SQ85[187] = "off";
    SQ85[188] = "off";
    SQ85[189] = "off";
    SQ85[190] = "off";
    SQ85[191] = "off";
    SQ85[192] = "off";
    SQ85[193] = "off";
    SQ85[194] = "off";


    var SQ85OFF = new Array();

    SQ85OFF[0] = "b1";
    SQ85OFF[1] = "c1";
    SQ85OFF[2] = "d1";
    SQ85OFF[3] = "e1";
    SQ85OFF[4] = "f1";
    SQ85OFF[5] = "g1";
    SQ85OFF[6] = "h1";
    SQ85OFF[7] = "i1";
    SQ85OFF[8] = "j1";
    SQ85OFF[9] = "a2";
    SQ85OFF[10] = "k2";
    SQ85OFF[11] = "a3";
    SQ85OFF[12] = "k3";
    SQ85OFF[13] = "a4";
    SQ85OFF[14] = "k4";
    SQ85OFF[15] = "a5";
    SQ85OFF[16] = "k5";
    SQ85OFF[17] = "a6";
    SQ85OFF[18] = "k6";
    SQ85OFF[19] = "a7";
    SQ85OFF[20] = "k7";
    SQ85OFF[21] = "a8";
    SQ85OFF[22] = "k8";
    SQ85OFF[23] = "a9";
    SQ85OFF[24] = "k9";
    SQ85OFF[25] = "a10";
    SQ85OFF[26] = "k10";
    SQ85OFF[27] = "b11";
    SQ85OFF[28] = "c11";
    SQ85OFF[29] = "d11";
    SQ85OFF[30] = "e11";
    SQ85OFF[31] = "f11";
    SQ85OFF[32] = "g11";
    SQ85OFF[33] = "h11";
    SQ85OFF[34] = "i11";
    SQ85OFF[35] = "j11";

    var SQ85CENTER = "f6";

    var SQ85RIGHTDIA  = new Array();

    SQ85RIGHTDIA[0] = "no-a1";
    SQ85RIGHTDIA[1] = "b2";
    SQ85RIGHTDIA[2] = "c3";
    SQ85RIGHTDIA[3] = "d4";
    SQ85RIGHTDIA[4] = "e5";
    SQ85RIGHTDIA[5] = "g7";
    SQ85RIGHTDIA[6] = "h8";
    SQ85RIGHTDIA[7] = "i9";
    SQ85RIGHTDIA[8] = "j10";
    SQ85RIGHTDIA[9] = "no-k11";
        
    var SQ85LEFTDIA  = new Array();

    SQ85LEFTDIA[0] = "no-a11";
    SQ85LEFTDIA[1] = "b10";
    SQ85LEFTDIA[2] = "c9";
    SQ85LEFTDIA[3] = "d8";
    SQ85LEFTDIA[4] = "e7";
    SQ85LEFTDIA[5] = "g5";
    SQ85LEFTDIA[6] = "h4";
    SQ85LEFTDIA[7] = "i3";
    SQ85LEFTDIA[8] = "j2";
    SQ85LEFTDIA[9] = "no-k1";
    
    //------------------------------------------------------------------------------
    // Chess Util Functions
    //------------------------------------------------------------------------------
    var COLUMNS = 'abcdefghijk'.split('');

    function validMove(move) {
        // move should be a string
        if (typeof move !== 'string') return false;

        // move should be in the form of "e2-e4", "f6-d5"
        var tmp = move.split('-');
        if (tmp.length < 2 || tmp.length > 3) return false;
        return (validSquare(tmp[0]) === true && validSquare(tmp[1]) === true);
    }

    function validSquare(square) {
        if (typeof square !== 'string') return false;
        if ($.inArray(square, SQ85) > -1) {
            return true;
        } else {
            return false;
        }
    }

    function validPieceCode(code) {
        if (typeof code !== 'string') return false;
        return (code.search(/^[bw][IKQFSRWCNBP]$/) !== -1);
    }

    /* SQ85 FEN structure
    f111111111f
    1rnbskqbnr1
    1ppppppppp1
    11111111111
    11111111111
    11111111111
    11111111111
    11111111111
    1PPPPPPPPP1
    1RNBQKSBNR1
    F111111111F
    w - active color
    wKwQwMbKbQbMaKaQaMsKsQsM -castling
    c6 - En passant square 
    5 - quarter move clock
    2 - fullmove number
    */

    // TODO: this whole function could probably be replaced with a single regex
    function validFen(fen) {
        if (typeof fen !== 'string') return false;

        // cut off any move, castling, etc info from the end
        // we're only interested in position information
        fen = fen.replace(/ .+$/, '');

        // FEN should be 11 sections separated by slashes
        var chunks = fen.split('/');
        if (chunks.length !== 11) return false;

        // check the piece sections
        for (var i = 0; i < 11; i++) {
            if (chunks[i] === '' ||
                chunks[i].length > 11 ||
                chunks[i].search(/[^ikqfsrbcwnpIKQFSRNWCBP1-9]/) !== -1) {
                return false;
            }
        }

        return true;
    }
    // console.log("Valid FEN? " + validFen(START_FEN_SQ85));

    function validPositionObject(pos) {
        if (typeof pos !== 'object') return false;
        // console.log(pos);
        for (var i in pos) {
            // console.log(i);
            // if (pos.hasOwnProperty(i) !== true) continue;
            if (validSquare(i) !== true || validPieceCode(pos[i]) !== true) {
                return false;
            }
        }

        return true;
    }

    // convert FEN piece code to bP, wK, etc
    function fenToPieceCode(piece) {
        // black piece
        if (piece.toLowerCase() === piece) {
            return 'b' + piece.toUpperCase();
        }

        // white piece
        return 'w' + piece.toUpperCase();
    }

    // convert bP, wK, etc code to FEN structure
    function pieceCodeToFen(piece) {
        var tmp = piece.split('');

        // white piece
        if (tmp[0] === 'w') {
            return tmp[1].toUpperCase();
        }

        // black piece
        return tmp[1].toLowerCase();
    }

    // convert FEN string to position object
    // returns false if the FEN string is invalid
    function fenToObj(fen) {
        if (validFen(fen) !== true) {
            return false;
        }

        // cut off any move, castling, etc info from the end
        // we're only interested in position information
        fen = fen.replace(/ .+$/, '');

        var rows = fen.split('/');
        var position = {};

        var currentRow = 11;
        for (var i = 0; i < 11; i++) {
            var row = rows[i].split('');
            var colIndex = 0;

            // loop through each character in the FEN section
            for (var j = 0; j < row.length; j++) {
                // number / empty squares
                if (row[j].search(/[1-8]/) !== -1) {
                    var emptySquares = parseInt(row[j], 10);
                    colIndex += emptySquares;
                }
                // piece
                else {
                    var square = COLUMNS[colIndex] + currentRow;
                    position[square] = fenToPieceCode(row[j]);
                    colIndex++;
                }
            }

            currentRow--;
        }

        return position;
    }

    // position object to FEN string
    // returns false if the obj is not a valid position object
    function objToFen(obj) {
        if (validPositionObject(obj) !== true) {
            return false;
        }

        var fen = '';

        var currentRow = 11;
        for (var i = 0; i < 11; i++) {
            for (var j = 0; j < 11; j++) {
                var square = COLUMNS[j] + currentRow;

                // piece exists
                if (obj.hasOwnProperty(square) === true) {
                    fen += pieceCodeToFen(obj[square]);
                }

                // empty space
                else {
                    fen += '1';
                }
            }
            if (i !== 10) {
                fen += '/';
            }

            currentRow--;
        }

        return fen;
    }

    window['ChessBoard'] = window['ChessBoard'] || function (containerElOrId, cfg) {
        'use strict';

        cfg = cfg || {};

        //------------------------------------------------------------------------------
        // Constants
        //------------------------------------------------------------------------------

        var MINIMUM_JQUERY_VERSION = '1.7.0',
            // START_FEN = 'f111111111f/1rnbqksbnr1/1ppppppppp1/11111111111/11111111111/11111111111/11111111111/11111111111/1PPPPPPPPP1/1RNBQKSBNR1/F111111111F',
            START_POSITION = fenToObj(START_FEN);

        // use unique class names to prevent clashing with anything else on the page
        // and simplify selectors
        var CSS = {
            alpha: 'alpha-d2270',
            black: 'black-3c85d',
            board: 'board-b72b1',
            chessboard: 'chessboard-63f37',
            clearfix: 'clearfix-7da63',
            highlight0: 'highlight0-32855',
            highlight1: 'highlight1-32417',
            highlight2: 'highlight2-9c5d2',
            highlight3: 'highlight3-9c5d2',
            highlight4: 'highlight4-9c5d2',
            wait: 'wait-53d37',
            showsidewhite: 'showsidewhite-53d37',
            showsideblack: 'showsideblack-53d37',
            notation: 'notation-322f9',
            numeric: 'numeric-fc462',
            piece: 'piece-417db',
            row: 'row-5277c',
            sparePieces: 'spare-pieces-7492f',
            sparePiecesBottom: 'spare-pieces-bottom-ae20f',
            sparePiecesTop: 'spare-pieces-top-4028b',
            square: 'square-55d63',
            white: 'white-1e1d7',
            off: 'off-53d36',
            ase: 'ase-53d37',
            persian: 'persian-53d37',
            rightdia: 'rightdia-53d38',
            leftdia: 'leftdia-53d39',            
            header: 'header-23des',
            footer: 'footer-23des'
        };

        //------------------------------------------------------------------------------
        // Module Scope Variables
        //------------------------------------------------------------------------------

        // DOM elements
        var containerEl,
            boardEl,
            draggedPieceEl,
            sparePiecesTopEl,
            sparePiecesBottomEl;

        // constructor return object
        var widget = {};

        //------------------------------------------------------------------------------
        // Stateful
        //------------------------------------------------------------------------------

        var ANIMATION_HAPPENING = false,
            BOARD_BORDER_SIZE = 2,
            CURRENT_ORIENTATION = 'white',
            CURRENT_POSITION = {},
            SQUARE_SIZE,
            DRAGGED_PIECE,
            DRAGGED_PIECE_LOCATION,
            DRAGGED_PIECE_SOURCE,
            DRAGGING_A_PIECE = false,
            SPARE_PIECE_ELS_IDS = {},
            SQUARE_ELS_IDS = {},
            SQUARE_ELS_OFFSETS;

        //------------------------------------------------------------------------------
        // JS Util Functions
        //------------------------------------------------------------------------------

        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        function createId() {
            return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function (c) {
                var r = Math.random() * 16 | 0;
                return r.toString(16);
            });
        }

        function deepCopy(thing) {
            return JSON.parse(JSON.stringify(thing));
        }

        function parseSemVer(version) {
            var tmp = version.split('.');
            return {
                major: parseInt(tmp[0], 10),
                minor: parseInt(tmp[1], 10),
                patch: parseInt(tmp[2], 10)
            };
        }

        // returns true if version is >= minimum
        function compareSemVer(version, minimum) {
            version = parseSemVer(version);
            minimum = parseSemVer(minimum);

            var versionNum = (version.major * 10000 * 10000) +
                (version.minor * 10000) + version.patch;
            var minimumNum = (minimum.major * 10000 * 10000) +
                (minimum.minor * 10000) + minimum.patch;

            return (versionNum >= minimumNum);
        }

        //------------------------------------------------------------------------------
        // Validation / Errors
        //------------------------------------------------------------------------------

        function error(code, msg, obj) {
            // do nothing if showErrors is not set
            if (cfg.hasOwnProperty('showErrors') !== true ||
                cfg.showErrors === false) {
                return;
            }

            var errorText = 'ChessBoard Error ' + code + ': ' + msg;

            // print to console
            if (cfg.showErrors === 'console' &&
                typeof console === 'object' &&
                typeof console.log === 'function') {
                console.log(errorText);
                if (arguments.length >= 2) {
                    console.log(obj);
                }
                return;
            }

            // alert errors
            if (cfg.showErrors === 'alert') {
                if (obj) {
                    errorText += '\n\n' + JSON.stringify(obj);
                }
                window.alert(errorText);
                return;
            }

            // custom function
            if (typeof cfg.showErrors === 'function') {
                cfg.showErrors(code, msg, obj);
            }
        }

        // check dependencies
        function checkDeps() {
            // if containerId is a string, it must be the ID of a DOM node
            if (typeof containerElOrId === 'string') {
                // cannot be empty
                if (containerElOrId === '') {
                    window.alert('ChessBoard Error 1001: ' +
                        'The first argument to ChessBoard() cannot be an empty string.' +
                        '\n\nExiting...');
                    return false;
                }

                // make sure the container element exists in the DOM
                var el = document.getElementById(containerElOrId);
                if (!el) {
                    window.alert('ChessBoard Error 1002: Element with id "' +
                        containerElOrId + '" does not exist in the DOM.' +
                        '\n\nExiting...');
                    return false;
                }

                // set the containerEl
                containerEl = $(el);
            }

            // else it must be something that becomes a jQuery collection
            // with size 1
            // ie: a single DOM node or jQuery object
            else {
                containerEl = $(containerElOrId);

                if (containerEl.length !== 1) {
                    window.alert('ChessBoard Error 1003: The first argument to ' +
                        'ChessBoard() must be an ID or a single DOM node.' +
                        '\n\nExiting...');
                    return false;
                }
            }

            // JSON must exist
            if (!window.JSON ||
                typeof JSON.stringify !== 'function' ||
                typeof JSON.parse !== 'function') {
                window.alert('ChessBoard Error 1004: JSON does not exist. ' +
                    'Please include a JSON polyfill.\n\nExiting...');
                return false;
            }

            // check for a compatible version of jQuery
            if (!(typeof window.$ && $.fn && $.fn.jquery &&
                compareSemVer($.fn.jquery, MINIMUM_JQUERY_VERSION) === true)) {
                window.alert('ChessBoard Error 1005: Unable to find a valid version ' +
                    'of jQuery. Please include jQuery ' + MINIMUM_JQUERY_VERSION + ' or ' +
                    'higher on the page.\n\nExiting...');
                return false;
            }

            return true;
        }

        function validAnimationSpeed(speed) {
            if (speed === 'fast' || speed === 'slow') {
                return true;
            }

            if ((parseInt(speed, 10) + '') !== (speed + '')) {
                return false;
            }

            return (speed >= 0);
        }

        // validate config / set default options
        function expandConfig() {
            if (typeof cfg === 'string' || validPositionObject(cfg) === true) {
                cfg = {
                    position: cfg
                };
            }

            // default for orientation is white
            if (cfg.orientation !== 'black') {
                cfg.orientation = 'white';
            }
            CURRENT_ORIENTATION = cfg.orientation;

            // default for showNotation is true
            if (cfg.showNotation !== false) {
                cfg.showNotation = true;
            }

            // default for draggable is false
            if (cfg.draggable !== true) {
                cfg.draggable = false;
            }

            // default for dropOffBoard is 'snapback'
            if (cfg.dropOffBoard !== 'trash') {
                cfg.dropOffBoard = 'snapback';
            }

            // default for sparePieces is false
            if (cfg.sparePieces !== true) {
                cfg.sparePieces = false;
            }

            // draggable must be true if sparePieces is enabled
            if (cfg.sparePieces === true) {
                cfg.draggable = true;
            }

            // default piece theme is wikipedia
            if (cfg.hasOwnProperty('pieceTheme') !== true ||
                (typeof cfg.pieceTheme !== 'string' &&
                    typeof cfg.pieceTheme !== 'function')) {
                cfg.pieceTheme = 'img/chesspieces/wikipedia/{piece}.png';
            }

            // animation speeds
            if (cfg.hasOwnProperty('appearSpeed') !== true ||
                validAnimationSpeed(cfg.appearSpeed) !== true) {
                cfg.appearSpeed = 200;
            }
            if (cfg.hasOwnProperty('moveSpeed') !== true ||
                validAnimationSpeed(cfg.moveSpeed) !== true) {
                cfg.moveSpeed = 200;
            }
            if (cfg.hasOwnProperty('snapbackSpeed') !== true ||
                validAnimationSpeed(cfg.snapbackSpeed) !== true) {
                cfg.snapbackSpeed = 50;
            }
            if (cfg.hasOwnProperty('snapSpeed') !== true ||
                validAnimationSpeed(cfg.snapSpeed) !== true) {
                cfg.snapSpeed = 25;
            }
            if (cfg.hasOwnProperty('trashSpeed') !== true ||
                validAnimationSpeed(cfg.trashSpeed) !== true) {
                cfg.trashSpeed = 100;
            }

            // make sure position is valid
            if (cfg.hasOwnProperty('position') === true) {
                if (cfg.position === 'start') {
                    CURRENT_POSITION = deepCopy(START_POSITION);
                } else if (validFen(cfg.position) === true) {
                    CURRENT_POSITION = fenToObj(cfg.position);
                } else if (validPositionObject(cfg.position) === true) {
                    CURRENT_POSITION = deepCopy(cfg.position);
                } else {
                    error(7263, 'Invalid value passed to config.position.', cfg.position);
                }
            }

            return true;
        }

        //------------------------------------------------------------------------------
        // DOM Misc
        //------------------------------------------------------------------------------

        // calculates square size based on the width of the container
        // got a little CSS black magic here, so let me explain:
        // get the width of the container element (could be anything), reduce by 1 for
        // fudge factor, and then keep reducing until we find an exact mod 8 for
        // our square size
        function calculateSquareSize() {
            var containerWidth = parseInt(containerEl.css('width'), 10);

            // defensive, prevent infinite loop
            if (!containerWidth || containerWidth <= 0) {
                return 0;
            }

            // pad one pixel
            var boardWidth = containerWidth - 1;

            while (boardWidth % 11 !== 0 && boardWidth > 0) {
                boardWidth--;
            }

            return (boardWidth / 11);
        }

        // create random IDs for elements
        function createElIds() {
            // squares on the board
            for (var i = 0; i < COLUMNS.length; i++) {
                for (var j = 1; j <= 11; j++) {
                    var square = COLUMNS[i] + j;
                    SQUARE_ELS_IDS[square] = square + '-' + createId();
                }
            }

            // spare pieces
            var pieces = 'KQFSRBNP'.split('');
            for (var i = 0; i < pieces.length; i++) {
                var whitePiece = 'w' + pieces[i];
                var blackPiece = 'b' + pieces[i];
                SPARE_PIECE_ELS_IDS[whitePiece] = whitePiece + '-' + createId();
                SPARE_PIECE_ELS_IDS[blackPiece] = blackPiece + '-' + createId();
            }
        }

        //------------------------------------------------------------------------------
        // Markup Building
        //------------------------------------------------------------------------------

        function buildBoardContainer() {
            var html = '<div class="' + CSS.chessboard + '">';

            

            html += '</div>';
         
            if (cfg.sparePieces === true) {
                html += '<div class="' + CSS.sparePieces + ' ' +
                    CSS.sparePiecesTop + '"></div>';
            }

            html += '<div class="' + CSS.board + '"></div>';

            if (cfg.sparePieces === true) {
                html += '<div class="' + CSS.sparePieces + ' ' +
                    CSS.sparePiecesBottom + '"></div>';
            }
            return html;
        }

        function buildBoard(orientation) {
            if (orientation !== 'black') {
                orientation = 'white';
            }

            var html = '';

            // algebraic notation / orientation
            var alpha = deepCopy(COLUMNS);
            var row = 11;
            if (orientation === 'black') {
                alpha.reverse();
                row = 1;
            }

            var squareColor = 'black';
            for (var i = 0; i < 11; i++) {
                html += '<div class="' + CSS.row + '">';
                for (var j = 0; j < 11; j++) {
                    var square = alpha[j] + row;
                    if ($.inArray(square, SQ85OFF) > -1) {
                        html += '<div class="' + CSS.square + ' ' + CSS['off'] + ' '
                    } else {
                        if (square == SQ85CENTER && variant == "Persian") {
                            html += '<div class="' + CSS.square + ' ' + CSS['persian'] + ' '
                        } else if (square == SQ85CENTER && variant == "ASE") {
                            html += '<div class="' + CSS.square + ' ' + CSS['ase'] + ' '
                        } else if ($.inArray(square, SQ85RIGHTDIA) > -1 && variant == "ASE") {
                            html += '<div class="' + CSS.square + ' ' + CSS['rightdia'] + ' '
                        } else if ($.inArray(square, SQ85LEFTDIA) > -1 && variant == "ASE") {
                            html += '<div class="' + CSS.square + ' ' + CSS['leftdia'] + ' '
                        } else {
                            html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + ' '
                        }
                    }
                    html += 'square-' + square + '" ' +
                        'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' +
                        'id="' + SQUARE_ELS_IDS[square] + '" ' +
                        'data-square="' + square + '">';

                    if (cfg.showNotation === true) {
                        // alpha notation
                        if ((orientation === 'white' && row === 1) ||
                            (orientation === 'black' && row === 11)) {
                            html += '<div class="' + CSS.notation + ' ' + CSS.alpha + '">' +
                                alpha[j] + '</div>';
                        }

                        // numeric notation

                        if (j === 0) {
                            html += '<div class="' + CSS.notation + ' ' + CSS.numeric + '">' +
                                row + '</div>'; //Change to (row -1) to start notation from zero
                        }
                    }

                    html += '</div>'; // end .square

                    squareColor = (squareColor === 'white' ? 'black' : 'white');
                }
                html += '<div class="' + CSS.clearfix + '"></div></div>';

                // squareColor = (squareColor === 'white' ? 'black' : 'white');

                if (orientation === 'white') {
                    row--;
                } else {
                    row++;
                }
            }

            return html;
        }

        function buildPieceImgSrc(piece) {
            if (typeof cfg.pieceTheme === 'function') {
                return cfg.pieceTheme(piece);
            }

            if (typeof cfg.pieceTheme === 'string') {
                return cfg.pieceTheme.replace(/{piece}/g, piece);
            }

            // NOTE: this should never happen
            error(8272, 'Unable to build image source for cfg.pieceTheme.');
            return '';
        }

        function buildPiece(piece, hidden, id) {
            var html = '<img src="' + buildPieceImgSrc(piece) + '" ';
            if (id && typeof id === 'string') {
                html += 'id="' + id + '" ';
            }
            html += 'alt="" ' +
                'class="' + CSS.piece + '" ' +
                'data-piece="' + piece + '" ' +
                'style="width: ' + SQUARE_SIZE + 'px;' +
                'height: ' + SQUARE_SIZE + 'px;';
            if (hidden === true) {
                html += 'display:none;';
            }
            html += '" />';

            return html;
        }

        function buildSparePieces(color) {
            var pieces = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'];
            if (color === 'black') {
                pieces = ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];
            }

            var html = '';
            for (var i = 0; i < pieces.length; i++) {
                html += buildPiece(pieces[i], false, SPARE_PIECE_ELS_IDS[pieces[i]]);
            }

            return html;
        }

        //------------------------------------------------------------------------------
        // Animations
        //------------------------------------------------------------------------------

        function animateSquareToSquare(src, dest, piece, completeFn) {
            // get information about the source and destination squares
            var srcSquareEl = $('#' + SQUARE_ELS_IDS[src]);
            var srcSquarePosition = srcSquareEl.offset();
            var destSquareEl = $('#' + SQUARE_ELS_IDS[dest]);
            var destSquarePosition = destSquareEl.offset();

            // create the animated piece and absolutely position it
            // over the source square
            var animatedPieceId = createId();
            $('body').append(buildPiece(piece, true, animatedPieceId));
            var animatedPieceEl = $('#' + animatedPieceId);
            animatedPieceEl.css({
                display: '',
                position: 'absolute',
                top: srcSquarePosition.top,
                left: srcSquarePosition.left
            });

            // remove original piece from source square
            srcSquareEl.find('.' + CSS.piece).remove();

            // on complete
            var complete = function () {
                // add the "real" piece to the destination square
                destSquareEl.append(buildPiece(piece));

                // remove the animated piece
                animatedPieceEl.remove();

                // run complete function
                if (typeof completeFn === 'function') {
                    completeFn();
                }
            };

            // animate the piece to the destination square
            var opts = {
                duration: cfg.moveSpeed,
                complete: complete
            };
            animatedPieceEl.animate(destSquarePosition, opts);
        }

        function animateSparePieceToSquare(piece, dest, completeFn) {
            var srcOffset = $('#' + SPARE_PIECE_ELS_IDS[piece]).offset();
            var destSquareEl = $('#' + SQUARE_ELS_IDS[dest]);
            var destOffset = destSquareEl.offset();

            // create the animate piece
            var pieceId = createId();
            $('body').append(buildPiece(piece, true, pieceId));
            var animatedPieceEl = $('#' + pieceId);
            animatedPieceEl.css({
                display: '',
                position: 'absolute',
                left: srcOffset.left,
                top: srcOffset.top
            });

            // on complete
            var complete = function () {
                // add the "real" piece to the destination square
                destSquareEl.find('.' + CSS.piece).remove();
                destSquareEl.append(buildPiece(piece));

                // remove the animated piece
                animatedPieceEl.remove();

                // run complete function
                if (typeof completeFn === 'function') {
                    completeFn();
                }
            };

            // animate the piece to the destination square
            var opts = {
                duration: cfg.moveSpeed,
                complete: complete
            };
            animatedPieceEl.animate(destOffset, opts);
        }

        // execute an array of animations
        function doAnimations(a, oldPos, newPos) {
            ANIMATION_HAPPENING = true;

            var numFinished = 0;

            function onFinish() {
                numFinished++;

                // exit if all the animations aren't finished
                if (numFinished !== a.length) return;

                drawPositionInstant();
                ANIMATION_HAPPENING = false;

                // run their onMoveEnd function
                if (cfg.hasOwnProperty('onMoveEnd') === true &&
                    typeof cfg.onMoveEnd === 'function') {
                    cfg.onMoveEnd(deepCopy(oldPos), deepCopy(newPos));
                }
            }

            for (var i = 0; i < a.length; i++) {
                // clear a piece
                if (a[i].type === 'clear') {
                    $('#' + SQUARE_ELS_IDS[a[i].square] + ' .' + CSS.piece)
                        .fadeOut(cfg.trashSpeed, onFinish);
                }

                // add a piece (no spare pieces)
                if (a[i].type === 'add' && cfg.sparePieces !== true) {
                    $('#' + SQUARE_ELS_IDS[a[i].square])
                        .append(buildPiece(a[i].piece, true))
                        .find('.' + CSS.piece)
                        .fadeIn(cfg.appearSpeed, onFinish);
                }

                // add a piece from a spare piece
                if (a[i].type === 'add' && cfg.sparePieces === true) {
                    animateSparePieceToSquare(a[i].piece, a[i].square, onFinish);
                }

                // move a piece
                if (a[i].type === 'move') {
                    animateSquareToSquare(a[i].source, a[i].destination, a[i].piece,
                        onFinish);
                }
            }
        }

        // returns the distance between two squares
        function squareDistance(s1, s2) {
            s1 = s1.split('');
            var s1x = COLUMNS.indexOf(s1[0]) + 1;
            var s1y = parseInt(s1[1], 10);

            s2 = s2.split('');
            var s2x = COLUMNS.indexOf(s2[0]) + 1;
            var s2y = parseInt(s2[1], 10);

            var xDelta = Math.abs(s1x - s2x);
            var yDelta = Math.abs(s1y - s2y);

            if (xDelta >= yDelta) return xDelta;
            return yDelta;
        }

        // returns an array of closest squares from square
        function createRadius(square) {
            var squares = [];

            // calculate distance of all squares
            for (var i = 0; i < 11; i++) {
                for (var j = 0; j < 11; j++) {
                    var s = COLUMNS[i] + (j + 1);

                    // skip the square we're starting from
                    if (square === s) continue;

                    squares.push({
                        square: s,
                        distance: squareDistance(square, s)
                    });
                }
            }

            // sort by distance
            squares.sort(function (a, b) {
                return a.distance - b.distance;
            });

            // just return the square code
            var squares2 = [];
            for (var i = 0; i < squares.length; i++) {
                squares2.push(squares[i].square);
            }

            return squares2;
        }

        // returns the square of the closest instance of piece
        // returns false if no instance of piece is found in position
        function findClosestPiece(position, piece, square) {
            // create array of closest squares from square
            var closestSquares = createRadius(square);

            // search through the position in order of distance for the piece
            for (var i = 0; i < closestSquares.length; i++) {
                var s = closestSquares[i];

                if (position.hasOwnProperty(s) === true && position[s] === piece) {
                    return s;
                }
            }

            return false;
        }

        // calculate an array of animations that need to happen in order to get
        // from pos1 to pos2
        function calculateAnimations(pos1, pos2) {
            // make copies of both
            pos1 = deepCopy(pos1);
            pos2 = deepCopy(pos2);

            var animations = [];
            var squaresMovedTo = {};

            // remove pieces that are the same in both positions
            for (var i in pos2) {
                if (pos2.hasOwnProperty(i) !== true) continue;

                if (pos1.hasOwnProperty(i) === true && pos1[i] === pos2[i]) {
                    delete pos1[i];
                    delete pos2[i];
                }
            }

            // find all the "move" animations
            for (var i in pos2) {
                if (pos2.hasOwnProperty(i) !== true) continue;

                var closestPiece = findClosestPiece(pos1, pos2[i], i);
                if (closestPiece !== false) {
                    animations.push({
                        type: 'move',
                        source: closestPiece,
                        destination: i,
                        piece: pos2[i]
                    });

                    delete pos1[closestPiece];
                    delete pos2[i];
                    squaresMovedTo[i] = true;
                }
            }

            // add pieces to pos2
            for (var i in pos2) {
                if (pos2.hasOwnProperty(i) !== true) continue;

                animations.push({
                    type: 'add',
                    square: i,
                    piece: pos2[i]
                })

                delete pos2[i];
            }

            // clear pieces from pos1
            for (var i in pos1) {
                if (pos1.hasOwnProperty(i) !== true) continue;

                // do not clear a piece if it is on a square that is the result
                // of a "move", ie: a piece capture
                if (squaresMovedTo.hasOwnProperty(i) === true) continue;

                animations.push({
                    type: 'clear',
                    square: i,
                    piece: pos1[i]
                });

                delete pos1[i];
            }

            return animations;
        }

        //------------------------------------------------------------------------------
        // Control Flow
        //------------------------------------------------------------------------------

        function drawPositionInstant() {
            // clear the board
            boardEl.find('.' + CSS.piece).remove();

            // add the pieces
            for (var i in CURRENT_POSITION) {
                if (CURRENT_POSITION.hasOwnProperty(i) !== true) continue;

                $('#' + SQUARE_ELS_IDS[i]).append(buildPiece(CURRENT_POSITION[i]));
            }
        }

        function drawBoard() {
            boardEl.html(buildBoard(CURRENT_ORIENTATION));
            drawPositionInstant();

            if (cfg.sparePieces === true) {
                if (CURRENT_ORIENTATION === 'white') {
                    sparePiecesTopEl.html(buildSparePieces('black'));
                    sparePiecesBottomEl.html(buildSparePieces('white'));
                } else {
                    sparePiecesTopEl.html(buildSparePieces('white'));
                    sparePiecesBottomEl.html(buildSparePieces('black'));
                }
            }
        }

        // given a position and a set of moves, return a new position
        // with the moves executed
        function calculatePositionFromMoves(position, moves) {
            position = deepCopy(position);

            for (var i in moves) {
                if (moves.hasOwnProperty(i) !== true) continue;

                // skip the move if the position doesn't have a piece on the source square
                if (position.hasOwnProperty(i) !== true) continue;

                var piece = position[i];
                delete position[i];
                position[moves[i]] = piece;
            }

            return position;
        }

        function setCurrentPosition(position) {
            var oldPos = deepCopy(CURRENT_POSITION);
            var newPos = deepCopy(position);
            var oldFen = objToFen(oldPos);
            var newFen = objToFen(newPos);

            // do nothing if no change in position
            if (oldFen === newFen) return;

            // run their onChange function
            if (cfg.hasOwnProperty('onChange') === true &&
                typeof cfg.onChange === 'function') {
                cfg.onChange(oldPos, newPos);
            }

            // update state
            CURRENT_POSITION = position;
        }

        function isXYOnSquare(x, y) {
            for (var i in SQUARE_ELS_OFFSETS) {
                if (SQUARE_ELS_OFFSETS.hasOwnProperty(i) !== true) continue;

                var s = SQUARE_ELS_OFFSETS[i];
                if (x >= s.left && x < s.left + SQUARE_SIZE &&
                    y >= s.top && y < s.top + SQUARE_SIZE) {
                    return i;
                }
            }

            return 'offboard';
        }

        // records the XY coords of every square into memory
        function captureSquareOffsets() {
            SQUARE_ELS_OFFSETS = {};

            for (var i in SQUARE_ELS_IDS) {
                if (SQUARE_ELS_IDS.hasOwnProperty(i) !== true) continue;

                SQUARE_ELS_OFFSETS[i] = $('#' + SQUARE_ELS_IDS[i]).offset();
            }
        }

        function removeSquareHighlights() {
            boardEl.find('.' + CSS.square)
                .removeClass(CSS.highlight1 + ' ' + CSS.highlight2 + ' ' + CSS.highlight3+ ' ' + CSS.highlight4);
        }

        function snapbackDraggedPiece() {
            // there is no "snapback" for spare pieces
            if (DRAGGED_PIECE_SOURCE === 'spare') {
                trashDraggedPiece();
                return;
            }

            removeSquareHighlights();

            // animation complete
            function complete() {
                drawPositionInstant();
                draggedPieceEl.css('display', 'none');

                // run their onSnapbackEnd function
                if (cfg.hasOwnProperty('onSnapbackEnd') === true &&
                    typeof cfg.onSnapbackEnd === 'function') {
                    cfg.onSnapbackEnd(DRAGGED_PIECE, DRAGGED_PIECE_SOURCE,
                        deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
                }
            }

            // get source square position
            var sourceSquarePosition =
                $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_SOURCE]).offset();

            // animate the piece to the target square
            var opts = {
                duration: cfg.snapbackSpeed,
                complete: complete
            };
            draggedPieceEl.animate(sourceSquarePosition, opts);

            // set state
            DRAGGING_A_PIECE = false;
        }

        function trashDraggedPiece() {
            removeSquareHighlights();

            // remove the source piece
            var newPosition = deepCopy(CURRENT_POSITION);
            delete newPosition[DRAGGED_PIECE_SOURCE];
            setCurrentPosition(newPosition);

            // redraw the position
            drawPositionInstant();

            // hide the dragged piece
            draggedPieceEl.fadeOut(cfg.trashSpeed);

            // set state
            DRAGGING_A_PIECE = false;
        }

        function dropDraggedPieceOnSquare(square) {

            removeSquareHighlights();
            // update position
            var newPosition = deepCopy(CURRENT_POSITION);
            delete newPosition[DRAGGED_PIECE_SOURCE];
            newPosition[square] = DRAGGED_PIECE;

            setCurrentPosition(newPosition);

            // get target square information
            var targetSquarePosition = $('#' + SQUARE_ELS_IDS[square]).offset();

            // animation complete
            var complete = function () {
                drawPositionInstant();
                draggedPieceEl.css('display', 'none');

                // execute their onSnapEnd function
                if (cfg.hasOwnProperty('onSnapEnd') === true &&
                    typeof cfg.onSnapEnd === 'function') {
                    cfg.onSnapEnd(DRAGGED_PIECE_SOURCE, square, DRAGGED_PIECE);
                }
            };

            // snap the piece to the target square
            var opts = {
                duration: cfg.snapSpeed,
                complete: complete
            };
            draggedPieceEl.animate(targetSquarePosition, opts);

            // set state
            DRAGGING_A_PIECE = false;
        }

        function beginDraggingPiece(source, piece, x, y) {
            // run their custom onDragStart function
            // their custom onDragStart function can cancel drag start
            if (typeof cfg.onDragStart === 'function' &&
                cfg.onDragStart(source, piece,
                    deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION) === false) {
                return;
            }

            // set state
            DRAGGING_A_PIECE = true;
            DRAGGED_PIECE = piece;
            DRAGGED_PIECE_SOURCE = source;

            // if the piece came from spare pieces, location is offboard
            if (source === 'spare') {
                DRAGGED_PIECE_LOCATION = 'offboard';
            } else {
                DRAGGED_PIECE_LOCATION = source;
            }

            // capture the x, y coords of all squares in memory
            captureSquareOffsets();

            // create the dragged piece
            draggedPieceEl.attr('src', buildPieceImgSrc(piece))
                .css({
                    display: '',
                    position: 'absolute',
                    left: x - (SQUARE_SIZE / 2),
                    top: y - (SQUARE_SIZE / 2)
                });

            if (source !== 'spare') {
                // highlight the source square and hide the piece
                $('#' + SQUARE_ELS_IDS[source]).addClass(CSS.highlight0)
                    .find('.' + CSS.piece).css('display', 'none');
            }
        }

        function updateDraggedPiece(x, y) {
            // put the dragged piece over the mouse cursor
            draggedPieceEl.css({
                left: x - (SQUARE_SIZE / 2),
                top: y - (SQUARE_SIZE / 2)
            });

            // get location
            var location = isXYOnSquare(x, y);

            // do nothing if the location has not changed
            if (location === DRAGGED_PIECE_LOCATION) return;

            // remove highlight from previous square
            if (validSquare(DRAGGED_PIECE_LOCATION) === true) {
                $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_LOCATION])
                    .removeClass(CSS.highlight2);
            }

            // add highlight to new square
            if (validSquare(location) === true) {
                $('#' + SQUARE_ELS_IDS[location]).addClass(CSS.highlight2);
            }

            // run onDragMove
            if (typeof cfg.onDragMove === 'function') {
                cfg.onDragMove(location, DRAGGED_PIECE_LOCATION,
                    DRAGGED_PIECE_SOURCE, DRAGGED_PIECE,
                    deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
            }

            // update state
            DRAGGED_PIECE_LOCATION = location;
        }

        function stopDraggedPiece(location) {
            // determine what the action should be
            var action = 'drop';
            if ($.inArray(location, SQ85OFF) > -1 && cfg.dropOffBoard === 'snapback')
            {
                action = 'snapback';
            }
            if (location === 'offboard' && cfg.dropOffBoard === 'snapback') {
                action = 'snapback';
            }
            if (location === 'offboard' && cfg.dropOffBoard === 'trash') {
                action = 'trash';
            }

            // run their onDrop function, which can potentially change the drop action
            if (cfg.hasOwnProperty('onDrop') === true &&
                typeof cfg.onDrop === 'function') {
                var newPosition = deepCopy(CURRENT_POSITION);

                // source piece is a spare piece and position is off the board
                //if (DRAGGED_PIECE_SOURCE === 'spare' && location === 'offboard') {...}
                // position has not changed; do nothing

                // source piece is a spare piece and position is on the board
                if (DRAGGED_PIECE_SOURCE === 'spare' && validSquare(location) === true) {
                    // add the piece to the board
                    newPosition[location] = DRAGGED_PIECE;
                }

                // source piece was on the board and position is off the board
                if (validSquare(DRAGGED_PIECE_SOURCE) === true && location === 'offboard') {
                    // remove the piece from the board
                    delete newPosition[DRAGGED_PIECE_SOURCE];
                }

                // source piece was on the board and position is on the board
                if (validSquare(DRAGGED_PIECE_SOURCE) === true &&
                    validSquare(location) === true) {
                    // move the piece
                    delete newPosition[DRAGGED_PIECE_SOURCE];
                    newPosition[location] = DRAGGED_PIECE;
                }

                var oldPosition = deepCopy(CURRENT_POSITION);

                var result = cfg.onDrop(DRAGGED_PIECE_SOURCE, location, DRAGGED_PIECE,
                    newPosition, oldPosition, CURRENT_ORIENTATION);
                if (result === 'snapback' || result === 'trash') {
                    action = result;
                }
            }

            // do it!
            if (action === 'snapback' || board_active == false) {
                snapbackDraggedPiece();
            } else if (action === 'trash') {
                trashDraggedPiece();
            } else if (action === 'drop') {
                dropDraggedPieceOnSquare(location);
            } 
            else 
            {
                snapbackDraggedPiece();
            }
        }

        //------------------------------------------------------------------------------
        // Public Methods
        //------------------------------------------------------------------------------

        // clear the board
        widget.clear = function (useAnimation) {
            widget.position({}, useAnimation);
        };

        /*
// get or set config properties
// TODO: write this, GitHub Issue #1
widget.config = function(arg1, arg2) {
  // get the current config
  if (arguments.length === 0) {
    return deepCopy(cfg);
  }
};
*/

        // remove the widget from the page
        widget.destroy = function () {
            // remove markup
            containerEl.html('');
            draggedPieceEl.remove();

            // remove event handlers
            containerEl.unbind();
        };

        // shorthand method to get the current FEN
        widget.fen = function () {
            return widget.position('fen');
        };

        // flip orientation
        widget.flip = function () {
            widget.orientation('flip');
        };

        /*
// TODO: write this, GitHub Issue #5
widget.highlight = function() {

};
*/

        // move pieces
        widget.move = function () {
            // no need to throw an error here; just do nothing
            if (arguments.length === 0) return;

            var useAnimation = true;

            // collect the moves into an object
            var moves = {};
            for (var i = 0; i < arguments.length; i++) {
                // any "false" to this function means no animations
                if (arguments[i] === false) {
                    useAnimation = false;
                    continue;
                }

                // skip invalid arguments
                if (validMove(arguments[i]) !== true) {
                    error(2826, 'Invalid move passed to the move method.', arguments[i]);
                    continue;
                }

                var tmp = arguments[i].split('-');
                moves[tmp[0]] = tmp[1];
            }

            // calculate position from moves
            var newPos = calculatePositionFromMoves(CURRENT_POSITION, moves);

            // update the board
            widget.position(newPos, useAnimation);

            // return the new position object
            return newPos;
        };

        widget.is_active = function (bool) {
            board_active = bool;
        }

        widget.theme = function (color) {
        switch(color) {
            case "brown":
                CSS['white'] = 'white-1e1d7';
                CSS['black'] = 'black-3c85d';
                CSS['rightdia'] = 'rightdia-53d38';
                CSS['leftdia'] = 'leftdia-53d39';
                CSS['persian'] = 'persian-53d37';
                CSS['ase'] = 'ase-53d37';
                CSS['off'] = 'off-53d36';
            break;
            case "blue":
                CSS['white'] = 'white-blue-1e1d7';
                CSS['black'] = 'black-blue-3c85d';
                CSS['rightdia'] = 'rightdia-blue-53d38';
                CSS['leftdia'] = 'leftdia-blue-53d39';
                CSS['persian'] = 'persian-blue-53d37';
                CSS['ase'] = 'ase-blue-53d37';
                CSS['off'] = 'off-blue-53d36';
            break;
            case "green":
                CSS['white'] = 'white-green-1e1d7';
                CSS['black'] = 'black-green-3c85d';
                CSS['rightdia'] = 'rightdia-green-53d38';
                CSS['leftdia'] = 'leftdia-green-53d39';
                CSS['persian'] = 'persian-green-53d37';
                CSS['ase'] = 'ase-green-53d37';
                CSS['off'] = 'off-green-53d36';
            break;
            case "oriental":
                CSS['white'] = 'white-oriental-1e1d7';
                CSS['black'] = 'black-oriental-3c85d';
                CSS['rightdia'] = 'rightdia-oriental-53d38';
                CSS['leftdia'] = 'leftdia-oriental-53d39';
                CSS['persian'] = 'persian-oriental-53d37';
                CSS['ase'] = 'ase-oriental-53d37';
                CSS['off'] = 'off-oriental-53d36';
            break;
            case "debug":
                CSS['white'] = 'white-debug-1e1d7';
                CSS['black'] = 'black-debug-3c85d';
                CSS['rightdia'] = 'rightdia-debug-53d38';
                CSS['leftdia'] = 'leftdia-debug-53d39';
                CSS['persian'] = 'persian-debug-53d37';
                CSS['ase'] = 'ase-debug-53d37';
                CSS['off'] = 'off-debug-53d36';
            break;
        
            default:
            break;
            }
            drawBoard();
        }
        
        widget.orientation = function (arg) {
            // no arguments, return the current orientation
            if (arguments.length === 0) {
                return CURRENT_ORIENTATION;
            }

            // set to white or black
            if (arg === 'white' || arg === 'black') {
                CURRENT_ORIENTATION = arg;
                drawBoard();
                return;
            }

            // flip orientation
            if (arg === 'flip') {
                CURRENT_ORIENTATION = (CURRENT_ORIENTATION === 'white') ? 'black' : 'white';
                drawBoard();
                return;
            }

            error(5482, 'Invalid value passed to the orientation method.', arg);
        };

        widget.position = function (position, useAnimation) {
            // no arguments, return the current position
            if (arguments.length === 0) {
                return deepCopy(CURRENT_POSITION);
            }

            // get position as FEN
            if (typeof position === 'string' && position.toLowerCase() === 'fen') {
                return objToFen(CURRENT_POSITION);
            }

            // default for useAnimations is true
            if (useAnimation !== false) {
                useAnimation = true;
            }

            // start position
            if (typeof position === 'string' && position.toLowerCase() === 'start') {
                position = deepCopy(START_POSITION);
            }

            // convert FEN to position object
            if (validFen(position) === true) {
                position = fenToObj(position);
            }

            // validate position object
            if (validPositionObject(position) !== true) {
                error(6482, 'Invalid value passed to the position method.', position);
                return;
            }

            if (useAnimation === true) {
                // start the animations
                doAnimations(calculateAnimations(CURRENT_POSITION, position),
                    CURRENT_POSITION, position);

                // set the new position
                setCurrentPosition(position);
            }
            // instant update
            else {
                setCurrentPosition(position);
                drawPositionInstant();
            }
        };


        widget.redraw = function () {
            drawBoard();
        };

        widget.resize = function () {
            // calulate the new square size
            SQUARE_SIZE = calculateSquareSize();

            // set board width
            boardEl.css('width', (SQUARE_SIZE * 11) + 'px');

            // set drag piece size
            draggedPieceEl.css({
                height: SQUARE_SIZE,
                width: SQUARE_SIZE
            });

            // spare pieces
            if (cfg.sparePieces === true) {
                containerEl.find('.' + CSS.sparePieces)
                    .css('paddingLeft', (SQUARE_SIZE + BOARD_BORDER_SIZE) + 'px');
            }

            // redraw the board
            drawBoard();
        };
        
        widget.removehighlights = function(){
           removeSquareHighlights(); 
        };


        widget.highlight = function (from, to) {
            removeSquareHighlights();
            $('#' + SQUARE_ELS_IDS[from]).addClass(CSS.highlight2)
            $('#' + SQUARE_ELS_IDS[to]).addClass(CSS.highlight2)
        };
        
        widget.highlight_mate = function (square) {
            removeSquareHighlights();
            $('#' + SQUARE_ELS_IDS[square]).addClass(CSS.highlight3)
        };
        widget.highlight_check = function (square) {
            removeSquareHighlights();
            $('#' + SQUARE_ELS_IDS[square]).addClass(CSS.highlight4)
        };
        

        //------------------------------------------------------------------------------
        // Spiner
        //------------------------------------------------------------------------------

        var opts = {
              lines: 12 // The number of lines to draw
            , length: spinner_length // The length of each line
            , width: 2 // The line thickness
            , radius: spinner_radius // The radius of the inner circle
            , scale: 1 // Scales overall size of the spinner
            , corners: 1 // Corner roundness (0..1)
            , color: '#FFFFFF' // #rgb or #rrggbb or array of colors
            , opacity: 0.10 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 1.2 // Rounds per second
            , trail: 74 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , top: '50%' // Top position relative to parent
            , left: '50%' // Left position relative to parent
            , shadow: false // Whether to render a shadow
            , hwaccel: false // Whether to use hardware acceleration
            , position: 'absolute' // Element positioning
            }

        var spinner = new Spinner(opts);

        widget.logo = function (logo)
        {
            var logo_square;
            if (CURRENT_ORIENTATION == 'white') logo_square = 'f11';
            else logo_square = 'f1';
            var target = document.getElementById(SQUARE_ELS_IDS[logo_square]);
              
            switch(logo) {
                case "white_to_move":
                    spinner.stop();
                    $('#' + SQUARE_ELS_IDS[logo_square]).removeClass(CSS.showsideblack);  
                    $('#' + SQUARE_ELS_IDS[logo_square]).addClass(CSS.showsidewhite);
                    break;
                case "black_to_move":
                    spinner.stop();
                    $('#' + SQUARE_ELS_IDS[logo_square]).removeClass(CSS.showsidewhite);  
                    $('#' + SQUARE_ELS_IDS[logo_square]).addClass(CSS.showsideblack);
                    break;
                case "wait":
                    // $('#' + SQUARE_ELS_IDS[logo_square]).removeClass(CSS.showsidewhite);
                    // $('#' + SQUARE_ELS_IDS[logo_square]).removeClass(CSS.showsideblack);  
                    spinner.spin(target);
                    break;
                default:
                    break
            }
        }
        
        // set the starting position
        widget.start = function (useAnimation) {
            widget.position('start', useAnimation);
        };

        //------------------------------------------------------------------------------
        // Browser Events
        //------------------------------------------------------------------------------

        function isTouchDevice() {
            return ('ontouchstart' in document.documentElement);
        }

        // reference: http://www.quirksmode.org/js/detect.html
        function isMSIE() {
            return (navigator && navigator.userAgent &&
                navigator.userAgent.search(/MSIE/) !== -1);
        }

        function stopDefault(e) {
            e.preventDefault();
        }

        function mousedownSquare(e) {
            
            // do nothing if we're not draggable
            if (cfg.draggable !== true) return;
            if (isTouchDevice() === true) return;
            var square = $(this).attr('data-square');
            var logo_square;

            if (CURRENT_ORIENTATION == 'white') logo_square = 'f11';
            else logo_square = 'f1';

            if (square == logo_square) CheckEngineBusy();

            // Move by click is not working properly on Android, needs debugging
            // movebyclick(square);
            
            // no piece on this square
            if (validSquare(square) !== true ||
                CURRENT_POSITION.hasOwnProperty(square) !== true) {
                return;
            }
            
            beginDraggingPiece(square, CURRENT_POSITION[square], e.pageX, e.pageY);
        }

        var f_square = "";
        var t_square = "";
        var begin_move = true;

        function touchstartSquare(e) {
            // do nothing if we're not draggable
            if (cfg.draggable !== true) return;

            var square = $(this).attr('data-square');
            var logo_square;

            if (CURRENT_ORIENTATION == 'white') logo_square = 'f11';
            else logo_square = 'f1';

            if (square == logo_square) CheckEngineBusy();

            if (begin_move == true)
            {
                // no piece on this square
                if (validSquare(square) !== true ||
                    CURRENT_POSITION.hasOwnProperty(square) !== true) {
                    return;
                }

                $('#' + SQUARE_ELS_IDS[square]).addClass(CSS.highlight1);
                f_square = square;
                begin_move = false;
            }
            else 
            {
                removeSquareHighlights();
                $('#' + SQUARE_ELS_IDS[square]).addClass(CSS.highlight1);
                t_square = square;
                begin_move = true;
                boardMoved(f_square, t_square);
            }           
        }

        function mousedownSparePiece(e) {
            // do nothing if sparePieces is not enabled
            if (cfg.sparePieces !== true) return;

            var piece = $(this).attr('data-piece');

            beginDraggingPiece('spare', piece, e.pageX, e.pageY);
        }

        function touchstartSparePiece(e) {
            return;
            // do nothing if sparePieces is not enabled
            if (cfg.sparePieces !== true) return;

            var piece = $(this).attr('data-piece');

            e = e.originalEvent;
            beginDraggingPiece('spare', piece,
                e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        }

        function mousemoveWindow(e) {
            // do nothing if we are not dragging a piece
            if (DRAGGING_A_PIECE !== true) return;

            updateDraggedPiece(e.pageX, e.pageY);
        }

        function touchmoveWindow(e) {
            return;
            // do nothing if we are not dragging a piece
            if (DRAGGING_A_PIECE !== true) return;

            // prevent screen from scrolling
            e.preventDefault();

            updateDraggedPiece(e.originalEvent.changedTouches[0].pageX,
                e.originalEvent.changedTouches[0].pageY);
        }

        function mouseupWindow(e) {
            // do nothing if we are not dragging a piece
            if (DRAGGING_A_PIECE !== true) return;

            // get the location
            var location = isXYOnSquare(e.pageX, e.pageY);

            stopDraggedPiece(location);
        }

        function touchendWindow(e) {
            return;
            // do nothing if we are not dragging a piece
            if (DRAGGING_A_PIECE !== true) return;

            // get the location
            var location = isXYOnSquare(e.originalEvent.changedTouches[0].pageX,
                e.originalEvent.changedTouches[0].pageY);

            stopDraggedPiece(location);
        }

        function mouseenterSquare(e) {
            // do not fire this event if we are dragging a piece
            // NOTE: this should never happen, but it's a safeguard
            if (DRAGGING_A_PIECE !== false) return;

            if (cfg.hasOwnProperty('onMouseoverSquare') !== true ||
                typeof cfg.onMouseoverSquare !== 'function') return;

            // get the square
            var square = $(e.currentTarget).attr('data-square');

            // NOTE: this should never happen; defensive
            if (validSquare(square) !== true) return;

            // get the piece on this square
            var piece = false;
            if (CURRENT_POSITION.hasOwnProperty(square) === true) {
                piece = CURRENT_POSITION[square];
            }

            // execute their function
            cfg.onMouseoverSquare(square, piece, deepCopy(CURRENT_POSITION),
                CURRENT_ORIENTATION);
        }

        function mouseleaveSquare(e) {
            // do not fire this event if we are dragging a piece
            // NOTE: this should never happen, but it's a safeguard
            if (DRAGGING_A_PIECE !== false) return;

            if (cfg.hasOwnProperty('onMouseoutSquare') !== true ||
                typeof cfg.onMouseoutSquare !== 'function') return;

            // get the square
            var square = $(e.currentTarget).attr('data-square');

            // NOTE: this should never happen; defensive
            if (validSquare(square) !== true) return;

            // get the piece on this square
            var piece = false;
            if (CURRENT_POSITION.hasOwnProperty(square) === true) {
                piece = CURRENT_POSITION[square];
            }

            // execute their function
            cfg.onMouseoutSquare(square, piece, deepCopy(CURRENT_POSITION),
                CURRENT_ORIENTATION);
        }

        //------------------------------------------------------------------------------
        // Initialization
        //------------------------------------------------------------------------------

        function addEvents() {
            // prevent browser "image drag"
            $('body').on('mousedown mousemove', '.' + CSS.piece, stopDefault);

            // mouse drag pieces
            boardEl.on('mousedown', '.' + CSS.square, mousedownSquare);
            containerEl.on('mousedown', '.' + CSS.sparePieces + ' .' + CSS.piece,
                mousedownSparePiece);

            // mouse enter / leave square
            boardEl.on('mouseenter', '.' + CSS.square, mouseenterSquare);
            boardEl.on('mouseleave', '.' + CSS.square, mouseleaveSquare);

            // IE doesn't like the events on the window object, but other browsers
            // perform better that way
            if (isMSIE() === true) {
                // IE-specific prevent browser "image drag"
                document.ondragstart = function () {
                    return false;
                };

                $('body').on('mousemove', mousemoveWindow);
                $('body').on('mouseup', mouseupWindow);
            } else {
                $(window).on('mousemove', mousemoveWindow);
                $(window).on('mouseup', mouseupWindow);
            }

            // touch drag pieces
            if (isTouchDevice() === true) {
                boardEl.on('touchstart', '.' + CSS.square, touchstartSquare);
                containerEl.on('touchstart', '.' + CSS.sparePieces + ' .' + CSS.piece,
                    touchstartSparePiece);
                $(window).on('touchmove', touchmoveWindow);
                $(window).on('touchend', touchendWindow);
            }
        }

        function initDom() {
            // build board and save it in memory
            containerEl.html(buildBoardContainer());
            boardEl = containerEl.find('.' + CSS.board);

            if (cfg.sparePieces === true) {
                sparePiecesTopEl = containerEl.find('.' + CSS.sparePiecesTop);
                sparePiecesBottomEl = containerEl.find('.' + CSS.sparePiecesBottom);
            }

            // create the drag piece
            var draggedPieceId = createId();
            $('body').append(buildPiece('wP', true, draggedPieceId));
            draggedPieceEl = $('#' + draggedPieceId);

            // get the border size
            BOARD_BORDER_SIZE = parseInt(boardEl.css('borderLeftWidth'), 10);

            // set the size and draw the board
            widget.resize();
        }

        function init() {
            if (checkDeps() !== true ||
                expandConfig() !== true) return;

            // create unique IDs for all the elements we will create
            createElIds();

            initDom();
            addEvents();
        }

        // go time
        init();

        // return the widget object
        return widget;

    }; // end window.ChessBoard

    // expose util functions
    window.ChessBoard.fenToObj = fenToObj;
    window.ChessBoard.objToFen = objToFen;

})(); // end anonymous wrapper