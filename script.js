//add levels
//timer stop count and "you win" msg
//add 2 buttons press


(function () {
    //defaults
    var defRows = 16,
        defColumns = 16,
        defMines = 40,
        parent = document.getElementById('matrix');
    //----------------------------------------------------------------------
    //Map, counters, etc.
    var mines_field,
        mines_count = 0,
        mines_count_screen = document.getElementById('bomb_count'),
        timer,
        timerIsOn = false,
        timerValue = 0,
        time_counter_screen = document.getElementById('time_counter'),
        rows,
        columns,
        mines,
        opened_cells_stack = [];
    //----------------------------------------------------------------------
    //Flags
    var theGameIsStarted = false;
    var theGameIsOver = true;
    //----------------------------------------------------------------------
    //Start the game with default parameters
    window.onload = Init;
    function Init() {
        //create field
        rows = defRows;
        columns = defColumns;
        mines = defMines;
        mines_count = 0;
        mines_count_screen.innerHTML = defMines;
        time_counter_screen.innerHTML = 0;
        mines_field = createField(rows, columns);
        DrawField(rows, columns);
    }

    //creates 2d array for storring mines and counters
    function createField(row, column) {
        var arr = new Array(i);
        for (var i = 0; i < row; i++) {
            arr[i] = new Array(column).fill('0');
        }
        return arr;
    }

    //Draw the map on the screen
    function DrawField(row, column) {
        for (var i = 0; i < row; i++) {
            var div = document.createElement('div');
            var br = document.createElement('br');
            div.className = 'DIV_static';
            div.id = "div_" + i;
            parent.appendChild(div);

            for (var j = 0; j < column; j++) {
                var child = document.createElement('div');
                child.className = 'DIV_hidden';
                child.id = i + "_" + j;
                child.localName = "bomb";
                document.getElementById('div_' + i).appendChild(child);
                child.addEventListener("mousedown", smileMouseDown);
                child.addEventListener("mouseup", smileMouseUp);
                child.addEventListener("mouseup", cellClicked);

            }
            document.getElementById('matrix').appendChild(br);
        }
    }

    //event listener call this function if the cell is clicked (event occured)
    function cellClicked(event) {
        if (event.which == 3) return; //right mouse button clicked, skip to marking the cell
        var cell = this.id.split('_');
        cell[0] = +cell[0];
        cell[1] = +cell[1];
        //check flags
        if (!theGameIsStarted) {
            theGameIsOver = false;
            theGameIsStarted = FillTheField(cell);
            OpenFreeCells({ x: cell[0], y: cell[1] });
            drawHintsOnField();
            StartCount();
            return;
        }
        if (theGameIsOver) { return; }
        CellAction(cell);


    }

    //action on cell: 1. ends the game if the bomb hitted; 2. shows empty cells and cells with hints.
    function CellAction(cell) {
        var x = +cell[0]; //row
        var y = +cell[1]; //column

        var cellToCheck = mines_field[cell[0]][cell[1]];
        if (cellToCheck == 'b') {
            theGameIsOver = true;
            StopCount();
            document.getElementById(cell[0] + '_' + cell[1]).className = 'DIV_blown_bomb';
            showAllBombs();
            document.getElementById('mouth').className = 'mouth_down';
            return;
        }
        OpenFreeCells({ x: cell[0], y: cell[1] });
        drawHintsOnField();
    }

    //shows all bombs after mistake
    function showAllBombs() {
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < columns; j++) {
                if (mines_field[i][j] == 'b') {
                    document.getElementById(i + '_' + j).className = 'DIV_blown_bomb';
                }
            }

        }
    }

    //recursion that finds all empty neighbors
    function OpenFreeCells(cell) {
        var x = cell.x; //row
        var y = cell.y; //column
        var cellIsOpen = (document.getElementById(x + '_' + y).className == 'DIV_open') ? true : false;
        //stop recursion if out of the field, there is a bomb in the cell,
        if ((mines_field[x][y] == 'b') || (mines_field[x][y] > 0)) {
            document.getElementById(x + '_' + y).className = 'DIV_open';
            opened_cells_stack.push({ x: x, y: y });
            return;
        }
        //if the cell is open return, else continue
        if (cellIsOpen) {
            return;
        }

        document.getElementById(x + '_' + y).className = 'DIV_open';
        opened_cells_stack.push({ x: x, y: y });

        if ((x > 0) && !cellIsOpen) {
            OpenFreeCells({ x: x - 1, y: y });
        }
        if ((x < rows - 1) && !cellIsOpen) {
            OpenFreeCells({ x: x + 1, y: y });
        }
        if ((y > 0) && !cellIsOpen) {
            OpenFreeCells({ x: x, y: y - 1 });
        }
        if ((y < columns - 1) && !cellIsOpen) {
            OpenFreeCells({ x: x, y: y + 1 });
        }
        if ((x > 0) && (y > 0) && !cellIsOpen) {
            OpenFreeCells({ x: x - 1, y: y - 1 });
        }

        if ((x < rows - 1) && (y > 0) && !cellIsOpen) {
            OpenFreeCells({ x: x + 1, y: y - 1 });
        }

        if ((x > 0) && (y < columns - 1) && !cellIsOpen) {
            OpenFreeCells({ x: x - 1, y: y + 1 });
        }

        if ((x < rows - 1) && (y < columns - 1) && !cellIsOpen) {
            OpenFreeCells({ x: x + 1, y: y + 1 });
        }
    }

    //show hints in open cells
    function drawHintsOnField() {
        for (var i = 0; i < opened_cells_stack.length; i++) {
            var x = opened_cells_stack[i].x;
            var y = opened_cells_stack[i].y;
            var currentCell = document.getElementById(x + '_' + y);
            if (mines_field[x][y] > 0) {
                currentCell.innerHTML = mines_field[x][y];
                currentCell.classList.add("bomb-count-" + mines_field[x][y]);
            }
        }
        opened_cells_stack = [];
    }
    //fill the field with bombs excluding clicked cell
    function FillTheField(startCell) {
        var tmp_mine, calcRow, calcColumn;
        do {
            tmp_mine = Math.floor((Math.random() * (rows * (columns - 1))));
            calcRow = (tmp_mine / columns).toFixed(0);
            calcColumn = (tmp_mine % columns).toFixed(0)
            //place a bomb to a free cell excluding startcell
            if (('b' !== mines_field[calcRow][calcColumn]) && (calcRow != startCell[0]) && (calcColumn != startCell[1])) {
                mines_field[calcRow][calcColumn] = 'b';
                mines_count++;
                fillHintsToArray(calcRow, calcColumn);
            }


        } while (mines_count < mines);
        return true;
    }
    //fill the bomb surrounded cells with hints
    function fillHintsToArray(x, y) {
        for (var i = +x - 1; i <= +x + 1; i++) {
            for (var j = +y - 1; j <= +y + 1; j++) {
                if ((i > -1) && (i < rows) & (j > -1) && (j < columns)) {
                    console.log("i = " + i + "  | j = " + j);
                    if (mines_field[i][j] != 'b') {
                        mines_field[i][j] = (+mines_field[i][j]) + 1;
                        console.log("mines_field[i][j] = " + mines_field[i][j] + "| i = " + i + "  | j = " + j);
                    }
                }
            }
        }
    }

    //mark cell as "bomb" or "?"
    function markCell(m_event) {
        if (theGameIsOver){return;}
        var target = m_event.target;
        var showMenu = true;
        switch (target.className) {
            case 'DIV_hidden':
                if (mines_count > 0) {
                    target.className = 'DIV_marked';
                    mines_count--;
                    mines_count_screen.innerHTML = mines_count;
                }
                showMenu = false;
                break;
            case 'DIV_marked':
                target.className = 'DIV_not_sure';
                target.innerHTML = "?";
                mines_count++;
                mines_count_screen.innerHTML = mines_count;
                showMenu = false;
                break;
            case 'DIV_not_sure':
                target.className = 'DIV_hidden';
                target.innerHTML = "";
                showMenu = false;
                break;
        }
        return showMenu;
    }

    document.oncontextmenu = markCell;

    function smileMouseDown() {
        if ((theGameIsStarted != true) || (theGameIsOver != true)) {
            document.getElementById('mouth').className = 'mouth_open';
        }
        
    }

    function smileMouseUp() {
        if ((theGameIsStarted == true) && (theGameIsOver == true)) {
            return true;
        }
        document.getElementById('mouth').className = 'mouth_up';
    }
    function StartCount() {
        if (!timerIsOn) {
            timerIsOn = true;
            TimerCounter();

        }
    }
    function TimerCounter() {

        time_counter_screen.innerHTML = timerValue;
        timerValue++;
        timer = setTimeout(TimerCounter, 1000);
    }
    function StopCount() {
        clearTimeout(timer);
        timerIsOn = false;
    }
})();