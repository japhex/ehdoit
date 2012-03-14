$(document).ready(function(){
	ehdoit.defaults();
});

var ehdoit = {
	addTask: function(){
		$('form').submit(function(){
			var $taskName = $('#new-task').val(),
					$taskList = $('#task-list').find('ul'),
					currentDateFull = new XDate(true),
					currentTime,
					currentMinutes = currentDateFull.getMinutes(),
					currentDateString,
					currentDateTruncated;
					currentDateString = currentDateFull.toString(),
					taskWithoutTags = utilities.stripTimeTag($taskName);
					taskWithoutTags = utilities.stripCategoryTag(taskWithoutTags);

			if (currentMinutes < 10){currentMinutes = '0' + currentMinutes};
			currentDateTruncated = currentDateFull.getHours() + ':' + currentMinutes;
			currentTime = currentDateFull.getDay() + '/' + currentDateFull.getMonth() + '/' + currentDateFull.getFullYear();
			$taskList.prepend('<li><h2 contenteditable="true" data-done="false" data-time="' + currentDateTruncated + '" data-date="' + currentTime + '" data-full-date="' + currentDateString + '" data-target-time="' + tags.tagmeup($taskName)[0] + '" data-category="' + tags.tagmeup($taskName)[1] + '">' + taskWithoutTags + '</h2> <span class="remove">&#215;</span><span class="done">&#10003;</span><span class="move">&#8597;</span><span class="created-at">created:' + currentDateTruncated + '</span><span class="completed-at"></span><span class="time-since"></span></li>');
			$('#new-task').val('');
			ehdoit.recalibrateTasks();
			times.timeBetween();
			ehdoit.editTask();
			return false;
		});
	},
	editTask: function(){
		var task = $('h2');
	
		task.on({
			focus: function(){$(this).addClass('focused');},
			blur: function(){
				$(this).removeClass('focused');
				if ($(this).text() == ""){
					ehdoit.deleteTask($(this));
				}
				ehdoit.recalibrateTasks();
			},
			keydown: function(e){if (e.keyCode == 13){$(this).blur();}}
		})
	},
	deleteTask: function(task){
		var trigger = task;
		//trigger.parent().addClass('deleted').delay(1510).queue(function(){
			trigger.parent().remove();
			ehdoit.recalibrateTasks();
		//});
	},
	loadTasks: function(){
		var tasks = localStorage.getItem('Tasks');
				tasks = JSON.parse(tasks),
				archive = "",
				contentEditable = false;
		if (tasks != null) {
			for (i = 0; i < tasks.length; i++) {
				if (tasks[i].done){archive = "archived"}
				if (tasks[i].completed == ""){contentEditable = true;}
				$('#task-list').find('ul').append('<li class="' + archive + '"><h2 contenteditable="' + contentEditable + '" data-done="' + tasks[i].done + '" data-time="' + tasks[i].time + '" data-date="' + tasks[i].date + '" data-full-date="' + tasks[i].fullDate + '" data-target-time="' + tasks[i].targetTime + '" data-category="' + tasks[i].category + '">' + tasks[i].name + '</h2> <span class="remove">&#215;</span><span class="done">&#10003;</span><span class="move">&#8597;</span><span class="created-at">created:' + tasks[i].time + '</span><span class="completed-at">' + tasks[i].completed + '</span><span class="time-since"></span></li>');
				archive = "";
				contentEditable = false;
			}
		times.timeBetween();
		}
	},
	recalibrateTasks: function(){
		var taskList = $('h2'),
				taskDone = false;
		localStorage.removeItem('Tasks');
		ehdoit.tasks = [];
		for (i = 0; i < taskList.length; i++) {
			if ($(taskList[i]).attr('data-done') == 'true'){taskDone = true;}
			ehdoit.tasks.push({name:$(taskList[i]).text(),done:taskDone,order:i,time:$(taskList[i]).attr('data-time'),date:$(taskList[i]).attr('data-date'),fullDate:$(taskList[i]).attr('data-full-date'),completed:$(taskList[i]).parent().find('.completed-at').text(),targetTime:$(taskList[i]).attr('data-target-time'),category:$(taskList[i]).attr('data-category')});
			taskDone = false;
		}
		localStorage.setItem('Tasks', JSON.stringify(ehdoit.tasks));
	},
	completeTask: function(){
		$('.done').live('click',function(){
			var currentTask = $(this),
					currentTaskParent = $(this).parent(),
					movedTask,
					currentTime = new XDate(),
					currentMinutes = currentTime.getMinutes();

			if (currentMinutes < 10){currentMinutes = '0' + currentMinutes};
			currentTaskParent.find('h2').attr('data-done','true');
			currentTaskParent.find('.completed-at').html('completed:' + currentTime.getHours() + ':' + currentMinutes);
			currentTaskParent.removeClass().addClass('archived');
			currentTaskParent.find('h2').removeAttr('contenteditable');
			currentTaskParent.find('.created-at span').remove();
			movedTask = currentTask.parent().detach();
			movedTask.insertAfter('li:not(.archived):last');
			ehdoit.recalibrateTasks();
			return false;
		});
	},
	defaults: function(){
		ehdoit.loadTasks();
		ehdoit.addTask();
		ehdoit.editTask();
		ehdoit.completeTask();
		if ($('#task-list li').length > 0){
			setInterval(function () {
				times.timeBetween();
			}, 1000);
		}
		$('.remove').live('click',function(){ehdoit.deleteTask($(this));});
    $('#task-list ul').sortable({cursor:"move",handle:'.move',opacity:'0.6',scroll:false,tolerance:'pointer',update:function() {ehdoit.recalibrateTasks();}});
	},
	tasks: []
}

// Utility functions

var tags = {
	tagmeup: function(taskValue){
		var tagTime = tags.timeTag(taskValue),
				tagCategory = tags.categoryTag(taskValue),
				tagTimeValue = "",
				tagCategoryValue = "";

		if (tagTime != null){
			tagTime = tagTime.toString();
			tagTimeValue = tagTime.split('@');
			tagTimeValue = tagTimeValue[1];
		}
		if (tagCategory != null){
			tagCategory = tagCategory.toString();
			tagCategoryValue = tagCategory.split('#');
			tagCategoryValue = tagCategoryValue[1];
		}
		return [tagTimeValue,tagCategoryValue];
	},	
	timeTag: function(taskValue){
	  var regexp = /[\@]+([A-Za-z0-9-_:]+)/gi;
    timeValue = taskValue.match(regexp);
 		return timeValue;
	},
	categoryTag: function(taskValue){
	  var regexp = /[\#]+([A-Za-z0-9-_]+)/gi;
    categoryValue = taskValue.match(regexp);
 		return categoryValue;
	}
}

var times = {
	timeBetween: function(){
		var taskList = $('h2'),
				startTime,
				timeNow;

		for (i = 0; i < taskList.length; i++) {
			var task = $(taskList[i]).parent(),
					createdAt = $(taskList[i]).attr('data-time');
			if (!task.hasClass('archived')){
				startTime = $(taskList[i]).attr('data-full-date');
				$(taskList[i]).parent().find('.created-at').html('created:' + createdAt + ' | <span>' + times.relative_time(startTime)[0] + '</span>');
				task.addClass(times.relative_time(startTime)[1]);
			}
		}
	},	
  parse_date: function(date_str) {
  	return Date.parse(date_str.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3'));
	},
  relative_time: function(time_value) {
	  var parsed_date = times.parse_date(time_value),
	  		relative_to = (arguments.length > 1) ? arguments[1] : new Date(),
	  		delta = parseInt((relative_to.getTime() - parsed_date) / 1000),
	  		pluralize = function (singular, n) {
	      return '' + n + ' ' + singular + (n == 1 ? '' : 's');
	  };
	  if (delta < 60) {return ['less than a minute ago',''];} else if (delta < (60 * 60)) {return ['about ' + pluralize("minute", parseInt(delta / 60)) + ' ago',''];} else if (delta < (24 * 60 * 60)) {return ['about ' + pluralize("hour", parseInt(delta / 3600)) + ' ago','hours-ago'];} else {return ['about ' + pluralize("day", parseInt(delta / 86400)) + ' ago','days-ago'];}
	}	
}

var utilities = {
	stripTimeTag: function(taskName){
	    var regexp = /[\@]+([A-Za-z0-9-:_]+)/gi,
			strippedTaskName;
	    strippedTaskName = taskName.replace(regexp, '');
	    return strippedTaskName;
	},
	stripCategoryTag: function (taskName) {
	    var regexp = /(?:^| )[\#]+([A-Za-z0-9-_]+)/gi,
			strippedTaskName;
	    strippedTaskName = taskName.replace(regexp, '');
	    return strippedTaskName;
	}
}