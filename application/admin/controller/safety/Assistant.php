<?php
/**
 * Created by PhpStorm.
 * User: xiong
 * Date: 2018/11/26
 * Time: 10:49
 */

namespace app\admin\controller\safety;

use app\common\controller\Backend;
use think\Session;
use think\Db;
use PHPExcel;
use PHPExcel_Style;
use PHPExcel_Style_Fill;
use PHPExcel_Style_Alignment;
use PHPExcel_Style_Border;
use PHPExcel_Style_NumberFormat;
use PHPExcel_IOFactory;
//副站长的项目管理
class Assistant extends Backend{
    protected $noNeedRight = ['*'];
    protected $relationSearch = true;
    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('project');
    }

    //项目列表
    public function index(){
        $adminId = Session::get('admin')['id'];
        //查出自己被指派的项目，指派主责
        if ($this->request->isAjax())
        {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();

            //自己指派的项目supervisor_assistant
            $map['supervisor_assistant']=$adminId;
            $field="l.licence_code `licence_code`,project.id,project.build_dept,project.project_name,project.address,project.supervisor_code,supervisor_progress,i.schedule `i.schedule`,i.project_kind `i.project_kind`,i.status `i.status`,i.situation `i.situation`,a.nickname `a.nickname`";
            
            $total = $this->model
                ->alias("project")
                ->field($field)
                ->where($where)
                ->where($map)
                ->join('quality_info i','project.quality_info=i.id')
                ->join('admin a','project.security_id=a.id','LEFT')
                ->join('licence l','project.licence_id=l.id')
                ->order($sort, $order)
                ->count();
                

            $list = $this->model
                ->alias("project",'')
                ->field($field)
                ->where($where)
                ->where($map)
                ->join('quality_info i','project.quality_info=i.id')
                ->join('admin a','project.security_id=a.id','LEFT')
                ->join('licence l','project.licence_id=l.id')
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();
                
            $result = array("total" => $total, "rows" => $list);
            return json($result);
        }
        return $this->view->fetch();
    }

    //详细信息
    public function detail($ids){
        $row=db('project')->where(['id'=>$ids])->find();
        $infoId=$row['quality_info'];
        $info=db('quality_info')->where(['id'=>$infoId])->find();
        $info['floor_up']=explode(",",$info['floor'])[0];
        $info['floor_down']=explode(",",$info['floor'])[1];
        $this->assign('row',$row);
        $this->assign('quality',$info);

        $infoId=$row['safety_info'];
        $info=db('safety_info')->where(['id'=>$infoId])->find();
        $this->assign('info',$info);

        $licence=db('licence')->where(['id'=>$row['licence_id']])->find();
        $this->assign('licence',$licence);
        return $this->view->fetch();
    }

    //选择主责安监员
    public function select($ids){
        //查出安监员 16
        $assistant['assistant'] = db('admin admin')->field('admin.id,admin.nickname name,admin.mobile')->join('auth_group_access a','a.uid=admin.id and a.group_id=16')->select();
        //查出当前安监员
        $assistant['now'] = db('project')->field('security_id')->where(['id'=>$ids])->find()['security_id'];
        $this->assign('assistant',$assistant);
        if ($this->request->isAjax())
        {
           $data['security_id'] = $this->request->post('security_id');
           db('project')->where(['id'=>$ids])->update($data);
           $this->success();
        }
        return $this->view->fetch();
    }


     
}