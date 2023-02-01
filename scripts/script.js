(() => {
	var change_type = document.getElementsByClassName('change-kind');
	var change_subscribe = document.getElementsByClassName('change-subscribe');
	var storage_range = document.getElementById('storage');
	var transfer_range = document.getElementById('transfer');
	var storage_lable = document.getElementById('storage-value');
	var transfer_lable = document.getElementById('transfer-value');
	var area = document.getElementById('chart-area');

	var chart_rows = document.getElementsByClassName('chart-rows');
	var cost_labels = document.getElementsByClassName('chart-rows-text');

	var type = 1;
	var subscribe = 1;
	var storage = 500;
	var transfer = 500;

	const COLORS = [
		`#FF0000`,
		`#FFA500`,
		`#800080`,
		`#0000FF`
	];

	storage_lable.textContent = storage_range.value;
	transfer_lable.textContent = transfer_range.value;

	const MAX_PERCENTAGE = 100;

	const MAX_GB = 1000;

	for (var item of chart_rows) {
		item.style.setProperty('--color', '#808080');
	}


	class hostings {
		constructor (name, cost_storage, cost_transfer, color, min_pay, max_pay, free_storage, free_transfer, additional_options) {
			this.name = name;
			this.cost_storage = cost_storage;
			this.cost_transfer = cost_transfer;
			this.color = color;
			this.min_pay = min_pay;
			this.max_pay = max_pay;
			this.free_storage = free_storage;
			this.free_transfer = free_transfer;
			this.additional_options = additional_options;
		}
	}

	var backblaze = new hostings("backblaze", [0.005, 0], [0.01, 0], COLORS[0], 7, 0, 0, 0, [false, false]);
	var bunny = new hostings("bunny", [0.01, 0.02], [0.01, 0], COLORS[0], -1, 10, 0, 0, [false, false]);
	var scaleway = new hostings("scaleway", [0.06, 0.03], [0.02, 0], COLORS[0], 0, 0, 75, 75, [false, false]);
	var vultr = new hostings("vultr", [0.01, 0], [0.01, 0], COLORS[0], 5, 0, 0, 0, [false, false]);

	const MAX_COST = Math.max( Math.max(...backblaze.cost_storage)*(MAX_GB-backblaze.free_storage)+Math.max(...backblaze.cost_transfer)*(MAX_GB-backblaze.free_transfer), Math.max(...bunny.cost_storage)*(MAX_GB-bunny.free_storage)+Math.max(...bunny.cost_transfer)*(MAX_GB-bunny.free_transfer), 
		Math.max(...scaleway.cost_storage)*(MAX_GB-scaleway.free_storage)+Math.max(...scaleway.cost_transfer)*(MAX_GB-scaleway.free_transfer), Math.max(...vultr.cost_storage)*(MAX_GB-vultr.free_storage)+Math.max(...vultr.cost_transfer)*(MAX_GB-vultr.free_transfer));

	var MAX_WIDTH = (((area.offsetWidth-(String(MAX_COST.toFixed(0)).length*32))-10) / 100) * MAX_PERCENTAGE;
	console.log(String(MAX_COST.toFixed(0)).length*52);

	let objects = [backblaze, bunny, scaleway, vultr];

	storage_range.addEventListener("input", (event) => {
		storage_lable.textContent = event.target.value
		storage = event.target.value;
		calculate();
	})
	transfer_range.addEventListener("input", (event) => {
		transfer_lable.textContent = event.target.value
		transfer = event.target.value;
		calculate();
	})
	window.addEventListener("resize", (event) => {
		MAX_WIDTH = (((area.offsetWidth-(String(MAX_COST.toFixed(0)).length*32))-10) / 100) * MAX_PERCENTAGE;
		calculate();
	});

	function calculate() {
		let costs = new Array();
		var i = 0;
		for (var object of objects) {
			var cost = 0;
			if (object.free_storage >= storage) cost+=0;
			else if (object.additional_options[0] == true) cost += object.cost_storage[1] * (storage-object.free_storage);
			else cost += object.cost_storage[0] * (storage-object.free_storage);
			if (object.free_transfer >= transfer) cost+=0;
			else if (object.additional_options[1] == true) cost += object.cost_transfer[1] * (transfer-object.free_transfer);
			else cost += object.cost_transfer[0] * (transfer-object.free_transfer);
			let width = cost/MAX_COST*MAX_WIDTH;
			if (cost < object.min_pay) {
				width = object.min_pay/MAX_COST*MAX_WIDTH;
				cost = object.min_pay;
			}
			else if (cost > object.max_pay && object.max_pay != 0) {
				width = object.max_pay/MAX_COST*MAX_WIDTH;
				cost = object.max_pay;
			}
			chart_rows[i].style.setProperty('--width', width+"px");
			cost_labels[i].textContent = cost.toFixed(2) + "$";
			costs.push(cost);
			i++;
		}
		var index_min = costs.indexOf(Math.min(...costs));
		for (var item of chart_rows) item.style.setProperty('--color', '#808080');
		chart_rows[index_min].style.setProperty('--color', COLORS[index_min]);
		console.log(index_min);
	}
	for (var i = 0; i < change_type.length; i++) {
    change_type[i].addEventListener('click', changeType);
    change_type[i].style.setProperty('--color','black');
    change_type[i].style.setProperty('--coloralt', 'rgba(130, 130, 130, 1)');
    change_type[i].style.setProperty('--font', 'bold');
    change_type[i].style.setProperty('--fontalt', 'normal');
  }
  for (var i = 0; i < change_subscribe.length; i++) {
    change_subscribe[i].addEventListener('click', changeSubscribe);
    change_subscribe[i].style.setProperty('--color','black');
    change_subscribe[i].style.setProperty('--coloralt', 'rgba(130, 130, 130, 1)');
    change_subscribe[i].style.setProperty('--font', 'bold');
    change_subscribe[i].style.setProperty('--fontalt', 'normal');
  }
  function changeType() {
  	for (var i = 0; i < change_type.length; i++) {
      if (objects[1].additional_options[0] == true) {
        change_type[i].style.setProperty('--color', 'black');
        change_type[i].style.setProperty('--coloralt', 'rgba(130, 130, 130, 1)');
        change_type[i].style.setProperty('--font', 'bold');
        change_type[i].style.setProperty('--fontalt', 'normal');
        objects[1].additional_options[0] = false;
        calculate();
      }
      else {
        change_type[i].style.setProperty('--color','rgba(130, 130, 130, 1)');
        change_type[i].style.setProperty('--coloralt', 'black');
        change_type[i].style.setProperty('--font', 'normal');
        change_type[i].style.setProperty('--fontalt', 'bold');
        objects[1].additional_options[0] = true;
        calculate();
      }
    }
  }
  function changeSubscribe() {
  	for (var i = 0; i < change_subscribe.length; i++) {
      if (objects[2].additional_options[0] == true) {
        change_subscribe[i].style.setProperty('--color', 'black');
        change_subscribe[i].style.setProperty('--coloralt', 'rgba(130, 130, 130, 1)');
        change_subscribe[i].style.setProperty('--font', 'bold');
        change_type[i].style.setProperty('--fontalt', 'normal');
        objects[2].additional_options[0] = false;
        calculate();
      }
      else {
        change_subscribe[i].style.setProperty('--color','rgba(130, 130, 130, 1)');
        change_subscribe[i].style.setProperty('--coloralt', 'black');
        change_subscribe[i].style.setProperty('--font', 'normal');
        change_subscribe[i].style.setProperty('--fontalt', 'bold');
        objects[2].additional_options[0] = true;
        calculate();
      }
    }
    if (subscribe == 0) subscribe = 1;
    else subscribe = 0;
  }
  function showVal(newVal) {
   storage_lable.value = storage_range.value;
  }
  calculate();
})();