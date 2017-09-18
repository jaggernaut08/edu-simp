$(function()
{
	$('#submit-parse').click(function()
	{
		stepped = 0;
		chunks = 0;
		rows = 0;
		var cs = "";


				$.ajax({
		  url: 'csv_data.csv',
		  dataType: 'text',
		}).done(successFunction);

		function successFunction(data) {

			start = performance.now();
			var results = Papa.parse(data,config);
			console.log("Synchronous parse results:", results);

			var allRows = results.data;
			console.log("allRows:", allRows);
			 var table = '<table class="tg">';
		  for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
		    if (singleRow === 0) {
		      table += '<thead>';
		      table += '<tr>';
		    } else {
		      table += '<tr>';
		    }
			var rowCells = allRows[singleRow];
			console.log("rowCells:", rowCells);
		    for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
		      if (singleRow === 0) {
		        table += '<th>';
		        table += rowCells[rowCell];
		        table += '</th>';
		      } else {
		        table += '<td class="tg-7uzy">';
		        table += rowCells[rowCell];
		        table += '</td>';
		      }
		    }
		    if (singleRow === 0) {
		      table += '</tr>';
		      table += '</thead>';
		      table += '<tbody>';
		    } else {
		      table += '</tr>';
		    }
		  } 
		  table += '</tbody>';
		  table += '</table>';
		  $('body').append(table);

		}



		var config = buildConfig();
	});
});



function buildConfig()
{
	return {
		delimiter: $('#delimiter').val(),
		newline: getLineEnding(),
		header: $('#header').prop('checked'),
		dynamicTyping: $('#dynamicTyping').prop('checked'),
		preview: parseInt($('#preview').val() || 0),
		step: $('#stream').prop('checked') ? stepFn : undefined,
		encoding: $('#encoding').val(),
		worker: $('#worker').prop('checked'),
		comments: $('#comments').val(),
		complete: completeFn,
		error: errorFn,
		download: $('#download').prop('checked'),
		fastMode: $('#fastmode').prop('checked'),
		skipEmptyLines: $('#skipEmptyLines').prop('checked'),
		chunk: $('#chunk').prop('checked') ? chunkFn : undefined,
		beforeFirstChunk: undefined,
	};

	function getLineEnding()
	{
		if ($('#newline-n').is(':checked'))
			return "\n";
		else if ($('#newline-r').is(':checked'))
			return "\r";
		else if ($('#newline-rn').is(':checked'))
			return "\r\n";
		else
			return "";
	}
}

function stepFn(results, parserHandle)
{
	stepped++;
	rows += results.data.length;

	parser = parserHandle;
	
	if (pauseChecked)
	{
		console.log(results, results.data[0]);
		parserHandle.pause();
		return;
	}
	
	if (printStepChecked)
		console.log(results, results.data[0]);
}

function chunkFn(results, streamer, file)
{
	if (!results)
		return;
	chunks++;
	rows += results.data.length;

	parser = streamer;

	if (printStepChecked)
		console.log("Chunk data:", results.data.length, results);

	if (pauseChecked)
	{
		console.log("Pausing; " + results.data.length + " rows in chunk; file:", file);
		streamer.pause();
		return;
	}
}

function errorFn(error, file)
{
	console.log("ERROR:", error, file);
}

function completeFn()
{
	end = performance.now();
	if (!$('#stream').prop('checked')
			&& !$('#chunk').prop('checked')
			&& arguments[0]
			&& arguments[0].data)
		rows = arguments[0].data.length;
	
	console.log("Finished input (async). Time:", end-start, arguments);
	console.log("Rows:", rows, "Stepped:", stepped, "Chunks:", chunks);
}