function debug (str){
	var text = $('#debugOutput textarea').val();
	// if str == '' -> clear
	if (str != '')
	{
	
		if (text != '')
		{
			text += '\n';
			text += str;
			$('#debugOutput textarea').val(text);
		}
		else
		{
			$('#debugOutput textarea').val(str);
		}
	}
	else
	{
		$('#debugOutput textarea').val('');
	}
	$('#debugOutput textarea').scrollTop($('#debugOutput textarea').prop("scrollHeight"));
}