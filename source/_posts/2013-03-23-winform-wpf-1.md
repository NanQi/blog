---
layout: post
title: "闲话WinFrom与WPF(1)"
subtitle: "差别篇——名称"
lasttime: 2013-05-25
description: "本篇主要整理WPF中对应WinForm中名称的一些变动"
category: 备忘
tags: [C#, WPF, 闲话WinFrom与WPF]
cover: /cover/framework.jpg
---

2012年6月，我曾准备连载这个话题[闲话WinFrom与WPF](http://www.cnblogs.com/nanqi/archive/2012/06/16/2551871.html)，最后半途而废。  
此时想起，算是零星整理，毕竟如我等从WinForm转到WPF的大有人在，一个框架的学习成本太高，写在这里，对自己算是一个备忘，对他人希望有所帮助。  

本人刚从WinForm转换倒WPF时，最烦的就是各种属性变名字的问题，感觉在这上面浪费时间真是太不划算。虽说换更正规的名字，更符合规范的名字有好处，但有时往往需要查找半天才能解决。  
其实称作换名字，往往根本不是仅仅换个名字的问题。  

##更新历史：

---

* 2013-03-23 &raquo; 创建文章
* 2013-05-27 &raquo; 增加 StartPosition，Frozen

###Enabled -> IsEnabled

---

如这种属性名更换的很多，WPF对于一些Boolean类型的属性会加Is前缀，来表达“是否”的概念，这当然是一种好的命名方式，但是同时你也会发现，也有不少同是Boolean类型的没有加Is，所以不能什么一棍子打死，不要写属性的时候，发现是Boolean类型，统统都加Is前缀。  
当然没有加Is前缀可能也有名称冲突的问题，比如说UIElement有一个IsFocused的依赖属性来表示当前元素是否有焦点，那么一个元素是否能获得焦点的名字就必须改一个，不能叫做IsFocusable，而是直接叫Focusable。  

###Visible -> Visibility

---

这个属性的改变和布局密切相关，将不显示分为保留与不保留布局空间。  
关于这个问题由来已久，这样改肯定有这样改的好处，但是往往形容一个元素的显示与否，都使用Boolean，这样就衍生出一个几乎所有项目里都有的一个转换器，并且名称都起的大同小异，如：BooleanToVisibilityConverter。  

###DropDownStyle -> IsEditable

---

在ASP.NET里，ComboBox叫DorpDownList，还能让我接受，但是WPF中把这个属性改为IsEditable又是为何？或许觉得ComboBox不需要第三个状态，但是这么一改，让我可是一顿好找啊，希望众位别犯我一样的错误。  

###HorizontalAlignment 与 TextAlignment

---

我知道这两个概念不一样，但是我不相信只有我一个人会同时用这两个枚举，令我想不通的主要还是为何两个枚举的值不一样？  

**HorizontalAlignment**

    public enum HorizontalAlignment
    {
        Left = 0,
        Center = 1,
        Right = 2,
        Stretch = 3,
    }
    
**TextAlignment**

    public enum TextAlignment
    {
        Left = 0,
        Right = 1,
        Center = 2,
        Justify = 3,
    }
    
或许真的我用法不对，我可能只是让其`文本`右对齐，而不是应该让其在`父容器`右对齐。  

###StartPosition 与 WindowStartupLocation

由于WinForm的样式再Designer文件中，所以我习惯使用打开属性框赋值；  
而WPF中都在XAML文件中控制，所以我一般不使用属性框。  
每当我创建一个WinForm项目的时候，都习惯性的要设置起始位置，但是在WPF中，我总是在XAML文件中写·start...`然后发现没有提示，我必须在后台代码中看到它是WindowStartupLocation，然后把它迁移到XAML文件中。  
关于Position和Location我这里就不过多争论了。  

###Frozen 与 FrozenColumnCount

或许这个属性不是那么常用，但是我还是要吐槽一下。  
我在WinForm中，只要取到DataGridView的某一列，然后设置Frozen = true就可以了，但是在WPF中发现，得使用DataGrid的属性FrozenColumnCount，而不是列的一个属性。  
这也就罢了，居然DataGridColumn还有IsFrozen这个属性，最可恶的这个属性居然还是只读的。  
好吧，我知道冻结列只能冻结前面的，WPF的做法没错，但是这是一个习惯性的问题，而且为了这种问题去查资料太不划算。  

