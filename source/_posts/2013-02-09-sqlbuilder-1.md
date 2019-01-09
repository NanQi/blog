---
layout: post
title: "SQL语句生成——界面操作"
description: "SQL语句生成，界面拖拽操作"
sourcecode: https://github.com/NanQi/demo/tree/master/SQLBuilderDemo
category: demo
tags: [C#, WinForm]
cover: cover/sqlbuilder.jpg
---

##几句闲扯

---

其实对于我本人而言，对于各种工具中自带的SQLBuilder并不是很有兴趣，而且从搞软件到现在，也只有在用MSSQL时用过这个功能，而且也只是在创建视图的时候使用。  
我之所以觉得这东西不是很有用，主要一个原因就是因为不管工具做的再好，还是得自己确定一次SQL语句是否正确。  
当然一些简单的，如只是勾选相应的字段，表与表之间的连接等情况，用起来还是比较方便的。  
做软件往往就是这样，不管你觉得这东西有用没用，让你做，你还是得做。  
本篇仅仅介绍一些界面操作。

##几张图片

---

![主界面](image/sqlbuilder/sqlbuilder1.png)

界面比较简陋，左边是表列表，右边是主要操作区。  
在操作区中，表的实现使用MDI窗体，拖拽字段打表连接主要使用GDI画出来。  

![右键菜单](image/sqlbuilder/sqlbuilder2.png)

删除连接也做的比较简单，使用右键实现，如果有兴趣了再做选中连接删除的功能。  

![编辑连接](image/sqlbuilder/sqlbuilder3.png)

右键菜单点击编辑或左键单击连接弹出编辑连接对话框。  

界面仿照DbVisualizer，功能只做了界面部分。

##几个问题

---

在做demo的时候，其中还是遇到了几个问题。  

###控件选择

![控件选择](image/sqlbuilder/sqlbuilder4.png)

关于那个可以勾选列的窗体，在WinForm中自然而然的会想到一个控件：CheckedListBox，但是随即发现，在支持拖拽操作的时候，要从坐标去获得对应的Item，这时候CheckedListBox还真不好弄，而ListView有现成的GetItemAt方法，但是ListView排列并不是一直竖着排列的，也就是说，如果高度不够，它会横着排列，而不是出现滚动条。

###画线问题

![画线问题](image/sqlbuilder/sqlbuilder5.png)

![画线问题](image/sqlbuilder/sqlbuilder6.png)

![画线问题](image/sqlbuilder/sqlbuilder7.png)

画这个线还是有些问题的，比如说左右关系，比如说移动表、拉动滚动条等等，当然，还有一些觉得比较难的我都没有做，比如说两条线相交，应该画出那种拐个弯的，比如说如何对于表排列，才能让所有关系都不相交。

###重叠问题

![重叠问题](image/sqlbuilder/sqlbuilder8.png)

![重叠问题](image/sqlbuilder/sqlbuilder9.png)

重叠问题本人没有解决好，所以希望有人帮忙解决一下，比如下面这种，也就是说当某一个Rectangle都被其他Rectangle遮住，这时候怎么都没法选择这个Rectangle。

![重叠问题](image/sqlbuilder/sqlbuilder10.png)

##几个地址

* 原文地址：[http://nanqi.info/blog/2013/02/09/sqlbuilder-1/](http://nanqi.info/blog/2013/02/09/sqlbuilder-1/)
* 我的博客：[nanqi.info](http://nanqi.info)
* 源码地址：[https://github.com/NanQi/demo/tree/master/SQLBuilderDemo](https://github.com/NanQi/demo/tree/master/SQLBuilderDemo)

