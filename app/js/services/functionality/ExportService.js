var myModule = angular.module("myApp.services");
myModule.factory('ExportService', function($http, $filter) {
    var service = {};

    service.exportTableToCSV = exportTableToCSV;
    service.exportNeighboursToCSV = exportNeighboursToCSV;
    service.exportGraphToPNG = exportGraphToPNG;

    function exportTableToCSV($table, filename) {
        var filename = "allPaths" + Date.now() + ".csv";
        var $headers = $table.find('tr:has(th)'),
            $rows = $table.find('tr:has(td)')
            // Temporary delimiter characters unlikely to be typed by keyboard
            // This is to avoid accidentally splitting the actual contents
            ,
            tmpColDelim = String.fromCharCode(11) // vertical tab character
            ,
            tmpRowDelim = String.fromCharCode(0) // null character
            // actual delimiter characters for CSV format
            ,
            colDelim = '","',
            rowDelim = '"\r\n"';
        // Grab text from table into CSV formatted string
        var csv = '"';
        csv += formatRows($headers.map(grabRow));
        csv += rowDelim;
        csv += formatRows($rows.map(grabRow)) + '"';
        // Data URI
        var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
        $(this)
            .attr({
                'download': filename,
                'href': csvData
                    //,'target' : '_blank' //if you want it to open in a new window
            });
        //------------------------------------------------------------
        // Helper Functions 
        //------------------------------------------------------------
        // Format the output so it has the appropriate delimiters
        function formatRows(rows) {
            return rows.get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim);
        }
        // Grab and format a row from the table
        function grabRow(i, row) {

            var $row = $(row);
            //for some reason $cols = $row.find('td') || $row.find('th') won't work...
            var $cols = $row.find('td');
            if (!$cols.length) $cols = $row.find('th');
            return $cols.map(grabCol)
                .get().join(tmpColDelim);
        }
        // Grab and format a column from the table 
        function grabCol(j, col) {
            var $col = $(col),
                $text = $col.text();
            return $text.replace('"', '""'); // escape double quotes
        }
    }

    function exportNeighboursToCSV(vm, index, networkType) {
        var fileName = $filter("ordinal")(index + 1) + "neighbours" + Date.now() + ".csv";
        var neighbours = vm.sdWithinTab.neighbours[index];
        var rowDelim = "\r\n";
        var colDelim = ",";
        var csv = "";
        var header = colDelim + neighbours.stroma.map(function(s) {
            return $filter('suffixTrim')(s);
        }).join();
        csv += header;
        csv += rowDelim;

        for (var i = 0; i < neighbours.epi.length; i++) {
            var temp = [];
            temp.push($filter('suffixTrim')(neighbours.epi[i]));
            for (var j = 0; j < neighbours.stroma.length; j++) {
                temp.push(vm.getInteractionViaDictionary(vm, neighbours.epi[i], neighbours.stroma[j], networkType));
            }

            csv += temp.join();
            csv += rowDelim;
        }

        var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
        var link = document.createElement("a");
        link.setAttribute("href", csvData);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function exportGraphToPNG(vm) {
        if (vm.sdWithinTab.cy == null) {
            return;
        }

        var fileName = "graph" + Date.now() + ".png";
        var png64 = vm.sdWithinTab.cy.png({full: true});

        var link = document.createElement("a");
        link.setAttribute("href", png64);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    }

    return service;
});
