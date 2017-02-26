---
layout: post
title: "WeifenLuo的DockPanel备忘"
description: "记录在使用WeifenLuo的DockPanel控件时的一些问题"
category: 备忘
tags: [C#, 第三方控件, WinForm]
cover: /cover/framework.jpg
---

##如何在双击窗体浮动时自定义其窗体属性

---
一个普遍的问题，一直以来都没有去解决，觉得无伤大雅。最后还是在同事的不断催促下才琢磨着怎么弄。说来平平无奇，只是在Form上又套了一层Form。具体步骤如下：

* 注册窗体DockStateChanged事件
* 判断this.DockState为DockState.Float
* 获取this.Parent转换成DockPane类型
* 属性FloatWindow即为所需窗体

代码如下：

    this.DockStateChanged += delegate
    {
        if(this.DockState == WeifenLuo.WinFormsUI.Docking.DockState.Float)
        {
            DockPane dock = this.Parent as DockPane;
            Form frmFloat = dock.FloatWindow;
            frmFloat.ClientSize = new Size(800, 600);
            frmFloat.FormBorderStyle = System.Windows.Forms.FormBorderStyle.Sizable;
            frmFloat.MinimizeBox = true;
            frmFloat.MaximizeBox = true;
        }
    }
