/**
 * 生成树形表格 V1.0.0
 * @author wangfan
 * @date 2017-08-09 17:50
 */
var newNodes = [];
//构建树形表格
jQuery.TreeTableWf = function (tree_id,tNodes){
	if ($("#" + tree_id).length > 0) {
		//对数据进行排序
	    var sort = function (s_pid) {
	        for (var i = 0, l = tNodes.length; i < l; i++) {
	            if (tNodes[i].pId == s_pid) {
	                var len = newNodes.length;
	                if (len > 0 && newNodes[len - 1].id == s_pid) {
	                    newNodes[len - 1].isParent = true;
	                }
	                newNodes.push(tNodes[i]);
	                sort(tNodes[i].id);
	            }
	        }
	    }
	    sort("");
	    //标记每一个树的第一个编号
	    var treeNumber = 0;
	    for (var i = 0, l = newNodes.length; i < l; i++) {
	    	treeNumber++;
	    	if(treeNumber==1){
		    	newNodes[i].isFirst = true;
	    	}
	    	if(newNodes[i].isParent){
	    		treeNumber = 0;
	    	}
	    }
	    
		//记录最大的广度，用于对表头序号扩宽
		var maxCol = 0;
		//遍历数据集合生成列表
		$.each(newNodes, function(index,one) {
			$t_tr = $("<tr></tr>");
			//子树
			if(one.pId!=null){
				//如果是子树有两步操作
				//第一步先对父节点增加rowspan值
				var prs = $("#"+one.pId).attr("rowspan");
				if(prs==undefined){
					prs = 1;
				}
				$("#"+one.pId).attr("rowspan",parseInt(prs)+1);
				//然后递归对祖先节点增加rowspan值
				rsDD(one.pId);
				
				//第二步如果是新生成的子树，对父节点及祖先节点增加空白单元格
				if(one.isFirst){
					//先判断父节点的同辈元素有没有子节点
					var haveSub = false;
					$.each(newNodes, function(index,tow) {
						if(tow.id==one.pId){
							//找父亲的同辈元素
							$.each(newNodes, function(index,three) {
								if(three.pId==tow.pId&&three.id!=tow.id){
									//找父亲的同辈元素有没有子节点
									$.each(newNodes, function(index,fore) {
										if(fore.pId==three.id){
											haveSub = true;
											return false;
										}
									});
								}
								if(tow.id==three.id){
									return false;
								}
							});
							return false;
						}
					});
					
					if(!haveSub){
						maxCol++;  //在此位置记录树的广度
						//先对父节点增加空白单元格
						$("#"+one.pId).after('<td class="trim-td"></td>');
						//然后递归对祖先节点增加空白单元格
						trimDD(one.pId);
					}
				}
			}
			//添加内容
			if(one.isParent){
				$t_tr.append("<td id='"+one.id+"' class='parent-td number-td'>"+one.number+"</td>");
			}else{
				$t_tr.append("<td id='"+one.id+"' class='number-td'>"+one.number+"</td>");
			}
			$.each(one.tds, function(index,temp) {
				if(temp==null){
					temp = "";
				}
				$t_tr.append("<td>"+temp+"</td>");
			});
			$("#"+tree_id+" tbody").append($t_tr);
			//最后针对树形又缩回去的情况对当前节点
			if(one.pId!=undefined){
				trim2DD(one.id,one.pId);
			}
			//最后针对最外层并列树处理
			if(one.pId!=undefined){
				trim3DD(one.id,one.pId);
			}
		});
		//最后对表头序号进行扩宽处理
		$("#"+tree_id+" thead tr").children().first().attr("colspan",maxCol);
		//$("#"+tree_id).addClass("treetable");
		return maxCol;
	}
}
//递归对父节点以及祖先节点增加rowspan值
function rsDD(id){
	$.each(newNodes, function(index,one) {
		if(one.id==id){
			var prs = $("#"+one.pId).attr("rowspan");
			if(prs==undefined){
				prs = 1;
			}
			$("#"+one.pId).attr("rowspan",parseInt(prs)+1);
			rsDD(one.pId);
			return false;
		}
	});
}
//递归为父节点及祖先节点添加空白单元格
function trimDD(id){
	$.each(newNodes, function(index,one) {
		if(one.id==id){
			/*if(one.pId!=""&&one.pId!=undefined&&one.pId!=null){
				$("#"+one.pId).after('<td class="trim-td"></td>');
				//对祖先元素的同辈元素进行加空白单元格
				$.each(newNodes, function(index,tow) {
					if(tow.pId==one.pId&&tow.id!=one.id){
						$("#"+tow.id).after('<td class="trim-td"></td>');
					}
				});
				//递归对祖先的祖先
				trimDD(one.pId);
			}*/
			return false;
		}
		$("#"+one.id).after('<td class="trim-td"></td>');
	});
}

/**
 * 对先伸展又缩进的情况进行处理
 * 保证比它父节点空格少一个
 */
function trim2DD(id,pId){
	var pSize = $("#"+pId).parent().find("td").size();
	var size = $("#"+id).parent().find("td").size();
	//console.log(id+":"+size+"--"+pId+":"+pSize)
	if(pSize-size>1){
		for(var i=0;i<(pSize-size-1);i++){
			$("#"+id).after('<td class="trim-td"></td>');
		}
		$("#"+id).addClass("big-leaf-td");
	}
}

//保证与它的同辈元素空格一样多
function trim3DD(id,pId){
	var pSize = 0;
	//找它的同辈元素
	$.each(newNodes, function(index,tow) {
		if(tow.pId==pId&&tow.id!=id){
			pSize = $("#"+tow.id).parent().find("td").size();
			return false;
		}
	});
	var size = $("#"+id).parent().find("td").size();
	//console.log(id+":"+size+"--"+pId+":"+pSize)
	if(pSize-size>0){
		for(var i=0;i<(pSize-size);i++){
			$("#"+id).after('<td class="trim-td"></td>');
		}
		$("#"+id).addClass("big-leaf-td");
	}
}