---
layout: post
title: "闲话WinFrom与WPF(2)"
subtitle: "控件篇——ComboBox"
description: "本篇主要介绍ComboBox控件使用的一些问题"
category: 备忘
tags: [C#, WPF, 闲话WinFrom与WPF]
cover: cover/framework.jpg
---

下拉框是一个很经典的控件，网上也有不少对于下拉框控件的扩展，其中包括与TreeView结合，做成树形选择；与DataGrid结合，做成列表选择；又或增加几个按钮来达到快捷编辑集合，选中项特殊显示等等。  
对于复杂的组合控件，我这里就不必多说，只说说原生ComboBox的一些应用。  

## 绑定数据源

---

简单的给Items添加项我就不说了，比如一些类型的选择多数使用这种，如一个员工的职位，是程序猿呢，还是项目经理。  
但往往这种职位，是需要考虑扩展的，也就是说这个职位也要可维护的，所以一般的软件做法，在数据库中以字典表的形式去保存这类情况，而数据库设计中又有这么一个要求，每个表都要有不重复的ID做主键，所以经常看到如此的表结构：

    GUID    varchar(50)
    Name    varchar(50)
    ...

那么，将该数据展示在ComboBox中，可能就需要展示的是Name，而你只想获取选择的GUID。  
所幸不管在WinForm还是WPF中，更或是在web开发中，即使纯Html的ComboBox，都有这种选择的一个值，而可能实际获得的是另一个值。  
WinForm中指定`DisplayMember`与`ValueMember`属性，WPF中指定`DisplayMemberPath`与`SelectedValuePath`属性，可以很简单的实现上述要求。  
而如果当这个字典表很大，或者客户需要给这种职位、类别之类的东西编号的时候，这时可能需要在显示的时候既显示编号，又显示名称，这时的表结构可能会这样：

    GUID    varchar(50)
    No      varchar(50)
    Name    varchar(50)
    ...

如果不拘于形式而言，一般完全可以使用No替换GUID，不管怎样，现在就是想要既获得主键列的值，又想显示`No + Name`的形式。  

### 重写ToString的一种实现方式

---

一般如此数据，都会有一个实体层（Model/Entity），比如上例，这个实体层可能看起来像这样：

    public class UserModel
    {
        public string GUID { get; set; }
        public string No { get; set; }
        public string Name { get; set; }
    }

假设我们从数据源中获取了一个`UserModel`的集合(如`List<UserModel>`)，将该集合直接绑定倒ComboBox中，而不指定它的那几个属性，那么他可能显示的是`UserModel`的类名全称，而为什么显示的是类的全名而不是其他呢，其实这里调用的是`UserModel`的`ToString`方法，而现在`UserModel`的`ToString`继承自`object`，`object`的`ToString`方法正是返回当前类的全名。  
知道了这点，我们想让显示`No + Name`的形式就好办的多了，我们重写`UserModel`的`ToString`方法，不指定ComboBox的上述几个属性，直接绑定数据源，`ToString`方法可能会这样：

    public void ToString()
    {
        return No + "---" + Name;
    }

但随即你就会发现WinForm有一个问题，如果你没有指定`DisplayMember`属性，而是只指定`ValueMember`属性，那么他会将`ValueMember`属性也当成`DisplayMember`属性去处理，而不会调用`ToString`方法。  

因为WinForm的这个问题，我们可能会使用另一种`万能`方式去获取选择项的某列值——使用`SelectedItem`属性。之所以现在才说，是因为`SelectedItem`属性是一个`object`类型，这样在我这个程序里，可能是`UserModel`，在另一个程序里，可能是`DataViewRow`，虽然`万能`，但实现不够优雅。  

### 添加一个属性

---

这点很简单，很正常，但是有些人认为不应该修改Model层的属性，Model层应该和数据库字段一一对应，而且堂而言之，为工具生成Model层替换方便...  
这里我也表示你下自己的观点，本人十分反感如此说法，正如在使用MVVM时不能在后台写代码一样反感，将原本一个事件，一行的代码，复杂的弄在xaml文件中去实现。  
添加一个属性，这种方式没有任何错误，如果使用MVVM，这个属性可以写在VM中，这个属性可能是这样：

    public string DisplayName
    {
        get 
        { 
            return ToString();
        }
    }

也可以不重写`ToString`，而是把`ToString`中的代码移过来。  

## 自动提示(AutoComplete)

---

关于自动提示，ComboBox其实都是天生就支持的，只是WinForm里做的功能多一点，而WPF功能少一点（只是定位）。  
当然，这只能说WPF比WinForm灵活，扩展方便。  

WinForm中的自动提示有专门的属性去做，如果你按类型排序，这几个类型都在杂项中，都以`AutoComplete`为前缀。  
其实这里的`AutoCompleteSource`属性定的很鸡肋，我用的基本也只有`ListItems`和`CustomSource`两个选项，而且本人认为`CustomSource`使用有点重复的概念，几乎没有人想在提示的时候使用一个数据源，而选择的时候使用另一个数据源。  
当然，也不排除各种变态的需求，但多做一点总比少做一点要好么，而也正是这点想法的分歧，铸就了WPF的反其道而行之。  

本来想写专文来说说这个，但是自己WPF所知甚浅，惟恐误人子弟，这里就随便扯两句，以WPF的ComboBox为例，也不算脱离主题。  

WPF的ComboBox其实是一个复杂控件，有一个`ToggleButton`用来表示下拉按钮，一个`Popup`用来表示下拉框，在编辑状态（IsEditable="True"），还会有一个`TextBox`，所以，如果WPF没有提供一个ComboBox，照道理来说，是很容易自己写一个ComboBox的。  
WPF中很多控件都是这样，可能都是使用`Primitives`命名控件下的控件组合而成。  

在WPF中如果自带的自动提示功能有点简单，只要设置3个属性即可：`IsEditable`，`StayOpenOnEdit`，`IsTextSearchEnabled`，而这种自动提示只是简简单单的一个定位功能，很多时候我们要的是筛选，而不是定位。  

要实现WPF中ComboBox的自动提示，方式可以有很多，假设咱们不考虑如何去实现对于数据源的筛选，而只是实现界面中当ComboBox的Text改变时，让其筛选，并展示下拉框（`Popup`）也不是一个简单的事情。  
其中一个原因是由于WPF中一个问题：  

    当设置ComboBox的IsDropDownOpen属性为True时（让ComboBox展开下拉框），TextBox中的文本被全选。  

其实WPF中的问题很多，又何止这一个。  
当然，正式因为WPF的简单性，才使得这些问题（Bug）都可以自己解决，所以很多东西，其实根本不是问题。  

---

写着写着，就写多了，至于如何实现WPF中ComboBox的自动提示，我看还是留在以后去细讲，这篇就此结束。
